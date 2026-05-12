
require('dotenv').config();
const express = require('express');
const kingsChatWebSdk = require('kingschat-web-sdk');
const axios = require('axios');

const app = express();
app.use(express.json());

// Load config from .env
const API_KEY = process.env.API_KEY;
const KC_CLIENT_ID = process.env.KC_CLIENT_ID;
const STATIC_REFRESH_TOKEN = 'YiJldd2+LNByuPKSvK5dTZtRmNN27tnR7GGLiBuXasM=';

// ─────────────────────────────────────────────────────────────
// SAFE JSON RESPONSE HELPER
// Removes all undefined values and converts them to null
// This prevents "undefined is not valid JSON" errors
// ─────────────────────────────────────────────────────────────
function jsonResponse(res, statusCode, data) {
  try {
    // Sanitize: convert undefined to null so JSON.stringify works
    const sanitized = JSON.parse(JSON.stringify(data, (key, val) => {
      return val === undefined ? null : val;
    }));
    res.status(statusCode).json(sanitized);
  } catch (err) {
    // Fallback if sanitization fails
    res.status(statusCode).json({
      success: false,
      error: 'Response encoding error',
      details: err.message || 'Unknown error'
    });
  }
}

// ─────────────────────────────────────────────────────────────
// ENDPOINT: /refresh-static-token
// ─────────────────────────────────────────────────────────────
app.post('/refresh-static-token', async (req, res) => {
  try {
    const { apiKey } = req.body;

    // Validate API key
    if (!apiKey || apiKey !== API_KEY) {
      return jsonResponse(res, 401, {
        success: false,
        error: 'Invalid API key'
      });
    }

    const response = await axios.post('https://kingslist-dispatch-api.onrender.com/api/refresh-token', {
      refreshToken: STATIC_REFRESH_TOKEN
    });

    if (!response.data?.success || !response.data.accessToken) {
      return jsonResponse(res, 500, {
        success: false,
        error: 'Failed to refresh access token',
        details: response.data || {}
      });
    }

    return jsonResponse(res, 200, {
      success: true,
      accessToken: response.data.accessToken || '',
      refreshToken: response.data.refreshToken || STATIC_REFRESH_TOKEN,
      expiresIn: response.data.expiresIn || 3600000
    });
  } catch (err) {
    return jsonResponse(res, 500, {
      success: false,
      error: 'Failed to refresh static token',
      details: err.message || 'Unknown error'
    });
  }
});

// ─────────────────────────────────────────────────────────────
// ENDPOINT: /send-notification
// ─────────────────────────────────────────────────────────────
app.post('/send-notification', async (req, res) => {
  try {
    const { apiKey, kcID, message } = req.body;

    if (!apiKey || apiKey !== API_KEY) {
      return jsonResponse(res, 401, {
        success: false,
        error: 'Invalid API key'
      });
    }

    if (!kcID || !message) {
      return jsonResponse(res, 400, {
        success: false,
        error: 'Missing kcID or message'
      });
    }

    const channel = 'healingschool';
    const response = await axios.post('https://web.espees.org/api/notifications/send', {
      kcID,
      message,
      channel
    });

    return jsonResponse(res, 200, {
      success: true,
      data: response.data || {}
    });
  } catch (err) {
    return jsonResponse(res, 500, {
      success: false,
      error: 'Failed to send espees notification',
      details: err.message || 'Unknown error'
    });
  }
});

// ─────────────────────────────────────────────────────────────
// ENDPOINT: /get-access-token
// ─────────────────────────────────────────────────────────────
app.post('/get-access-token', async (req, res) => {
  try {
    const { apiKey, refreshToken } = req.body;

    if (!apiKey || apiKey !== API_KEY) {
      return jsonResponse(res, 401, {
        success: false,
        error: 'Invalid API key'
      });
    }

    if (!refreshToken) {
      return jsonResponse(res, 400, {
        success: false,
        error: 'Missing refreshToken'
      });
    }

    const response = await axios.post('https://kingslist-dispatch-api.onrender.com/api/refresh-token', {
      refreshToken
    });

    if (!response.data?.success || !response.data.accessToken) {
      return jsonResponse(res, 500, {
        success: false,
        error: 'Failed to refresh access token',
        details: response.data || {}
      });
    }

    return jsonResponse(res, 200, {
      success: true,
      accessToken: response.data.accessToken || '',
      refreshToken: response.data.refreshToken || refreshToken,
      expiresIn: response.data.expiresIn || 3600000
    });
  } catch (err) {
    return jsonResponse(res, 500, {
      success: false,
      error: 'Failed to get access token',
      details: err.message || 'Unknown error'
    });
  }
});

// ─────────────────────────────────────────────────────────────
// ENDPOINT: /notify-batch
// Sends messages to one or multiple KingsChat users
// ─────────────────────────────────────────────────────────────
app.post('/notify-batch', async (req, res) => {
  try {
    const { apiKey, kcid, message, accessToken, refreshToken } = req.body;

    if (!apiKey || apiKey !== API_KEY) {
      return jsonResponse(res, 401, {
        success: false,
        error: 'Invalid API key'
      });
    }

    if (!kcid || !message || !accessToken || !refreshToken) {
      return jsonResponse(res, 400, {
        success: false,
        error: 'Missing kcid, message, accessToken, or refreshToken'
      });
    }

    // Convert single kcid to array format for consistent processing
    const kcidArray = Array.isArray(kcid) ? kcid : [kcid];

    let currentAccessToken = accessToken || '';
    let currentRefreshToken = refreshToken || '';
    const results = [];

    for (const currentKcid of kcidArray) {
      let attempt = 0;
      const maxAttempts = 2;
      let sent = false;

      while (attempt < maxAttempts && !sent) {
        attempt++;
        try {
          await kingsChatWebSdk.sendMessage({
            message: message || '',
            userIdentifier: currentKcid || '',
            accessToken: currentAccessToken || ''
          });
          results.push({ kcid: currentKcid, success: true });
          sent = true;
        } catch (err) {
          // Try to refresh token and retry once
          if (attempt < maxAttempts) {
            try {
              const response = await axios.post('https://kingslist-dispatch-api.onrender.com/api/refresh-token', {
                refreshToken: currentRefreshToken
              });

              if (!response.data?.success || !response.data.accessToken) {
                results.push({
                  kcid: currentKcid,
                  success: false,
                  error: 'Failed to refresh access token',
                  details: response.data || {}
                });
                sent = true;
              } else {
                currentAccessToken = response.data.accessToken || '';
                currentRefreshToken = response.data.refreshToken || currentRefreshToken;
              }
            } catch (refreshErr) {
              results.push({
                kcid: currentKcid,
                success: false,
                error: 'Failed to refresh token',
                details: refreshErr.message || 'Unknown error'
              });
              sent = true;
            }
          } else {
            results.push({
              kcid: currentKcid,
              success: false,
              error: 'Failed to send message',
              details: err.message || 'Unknown error'
            });
            sent = true;
          }
        }
      }
    }

    const allSuccess = results.every(r => r.success === true);
    return jsonResponse(res, 200, {
      success: allSuccess,
      results: results || [],
      message: allSuccess ? 'All messages sent successfully' : 'Some messages failed to send'
    });
  } catch (err) {
    return jsonResponse(res, 500, {
      success: false,
      error: 'Batch send error',
      details: err.message || 'Unknown error'
    });
  }
});

// ─────────────────────────────────────────────────────────────
// ENDPOINT: /notify
// Sends a message to a single KingsChat user
// ─────────────────────────────────────────────────────────────
app.post('/notify', async (req, res) => {
  try {
    const { apiKey, kcid, message, accessToken, refreshToken } = req.body;

    if (!apiKey || apiKey !== API_KEY) {
      return jsonResponse(res, 401, {
        success: false,
        error: 'Invalid API key'
      });
    }

    if (!kcid || !message || !accessToken || !refreshToken) {
      return jsonResponse(res, 400, {
        success: false,
        error: 'Missing kcid, message, accessToken, or refreshToken'
      });
    }

    let currentAccessToken = accessToken || '';
    let currentRefreshToken = refreshToken || '';
    let attempt = 0;
    const maxAttempts = 2;

    while (attempt < maxAttempts) {
      attempt++;
      try {
        await kingsChatWebSdk.sendMessage({
          message: message || '',
          userIdentifier: kcid || '',
          accessToken: currentAccessToken || ''
        });
        return jsonResponse(res, 200, {
          success: true
        });
      } catch (err) {
        // Try to refresh token and retry once
        if (attempt < maxAttempts) {
          try {
            const response = await axios.post('https://kingslist-dispatch-api.onrender.com/api/refresh-token', {
              refreshToken: currentRefreshToken
            });

            if (!response.data?.success || !response.data.accessToken) {
              return jsonResponse(res, 500, {
                success: false,
                error: 'Failed to refresh access token',
                details: response.data || {}
              });
            }

            currentAccessToken = response.data.accessToken || '';
            currentRefreshToken = response.data.refreshToken || currentRefreshToken;
          } catch (refreshErr) {
            return jsonResponse(res, 500, {
              success: false,
              error: 'Failed to refresh token',
              details: refreshErr.message || 'Unknown error'
            });
          }
        } else {
          return jsonResponse(res, 500, {
            success: false,
            error: 'Failed to send message',
            details: err.message || 'Unknown error'
          });
        }
      }
    }

    return jsonResponse(res, 500, {
      success: false,
      error: 'Failed to send message after retries'
    });
  } catch (err) {
    return jsonResponse(res, 500, {
      success: false,
      error: 'Send error',
      details: err.message || 'Unknown error'
    });
  }
});

// ─────────────────────────────────────────────────────────────
// 404 HANDLER
// ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  jsonResponse(res, 404, {
    success: false,
    error: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

// ─────────────────────────────────────────────────────────────
// ERROR HANDLER
// ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  jsonResponse(res, 500, {
    success: false,
    error: 'Internal server error',
    details: err.message || 'Unknown error'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Kinglist Notify API running on port ${PORT}`);
});
