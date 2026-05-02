// @ts-nocheck
/**
 * WXIFU BACKEND (GOOGLE APPS SCRIPT)
 * 1. Create a new Google Sheet.
 * 2. Go to Extensions > Apps Script.
 * 3. Paste THIS code (Pure JavaScript).
 * 4. Run the 'setup' function once.
 * 5. Deploy > New Deployment > Web App (Execute as Me, Access as Anyone).
 * 6. Copy the URL and paste it into lib/client.ts in your project.
 */

// Note: Globals like SpreadsheetApp and Utilities are automatically provided by the environment.

const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = {
    'profiles': ['id', 'name', 'avatar', 'bio', 'updated_at'],
    'media': ['id', 'created_at', 'user_id', 'type', 'src', 'videoSrc', 'description', 'category', 'tags', 'author', 'author_avatar'],
    'likes': ['id', 'media_id', 'user_id', 'created_at'],
    'comments': ['id', 'media_id', 'user_id', 'content', 'author_name', 'author_avatar', 'created_at'],
    'follows': ['id', 'follower_id', 'following_id', 'created_at'],
    'messages': ['id', 'sender_id', 'receiver_id', 'content', 'created_at', 'is_read']
  };

  for (const [name, headers] of Object.entries(sheets)) {
    let sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#f3f3f3");
      sheet.setFrozenRows(1);
    } else {
      // If sheet exists, ensure author columns exist (for legacy sheets)
      const currentHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      headers.forEach(h => {
        if (currentHeaders.indexOf(h) === -1) {
          sheet.getRange(1, sheet.getLastColumn() + 1).setValue(h).setFontWeight("bold").setBackground("#f3f3f3");
        }
      });
    }
  }
  return "Setup Complete. WXIFU Tables Initialized.";
}

function doPost(e) {
  const response = { success: false, data: null, error: null };
  try {
    const params = JSON.parse(e.postData.contents);
    const cmd = params.command;
    const payload = params.payload;

    switch (cmd) {
      case 'GET_PROFILES':
        response.data = getRows('profiles');
        response.success = true;
        break;
      case 'UPSERT_PROFILE':
        response.data = upsertRow('profiles', 'id', payload);
        response.success = true;
        break;
      case 'GET_MEDIA':
        response.data = getRows('media');
        response.success = true;
        break;
      case 'INSERT_MEDIA':
        payload.id = payload.id || Utilities.getUuid();
        payload.created_at = new Date().toISOString();
        response.data = appendRow('media', payload);
        response.success = true;
        break;
      case 'DELETE_MEDIA':
        deleteRow('media', 'id', payload.id);
        response.success = true;
        break;
      case 'UPDATE_MEDIA':
        updateRow('media', 'id', payload.id, payload.updates);
        response.success = true;
        break;
      case 'GET_LIKES':
        response.data = getRows('likes').filter(r => r.media_id === payload.media_id);
        response.success = true;
        break;
      case 'TOGGLE_LIKE':
        const existingLike = getRows('likes').find(r => r.media_id === payload.media_id && r.user_id === payload.user_id);
        if (existingLike) {
          deleteRow('likes', 'id', existingLike.id);
          response.data = { liked: false };
        } else {
          const newLike = { id: Utilities.getUuid(), ...payload, created_at: new Date().toISOString() };
          appendRow('likes', newLike);
          response.data = { liked: true };
        }
        response.success = true;
        break;
      case 'GET_COMMENTS':
        response.data = getRows('comments').filter(r => r.media_id === payload.media_id);
        response.success = true;
        break;
      case 'ADD_COMMENT':
        payload.id = Utilities.getUuid();
        payload.created_at = new Date().toISOString();
        response.data = appendRow('comments', payload);
        response.success = true;
        break;
      case 'DELETE_COMMENT':
        deleteRow('comments', 'id', payload.id);
        response.success = true;
        break;
      case 'GET_FOLLOWS':
        response.data = getRows('follows');
        response.success = true;
        break;
      case 'FOLLOW_USER':
        const f = { id: Utilities.getUuid(), ...payload, created_at: new Date().toISOString() };
        appendRow('follows', f);
        response.success = true;
        break;
      case 'UNFOLLOW_USER':
        const follow = getRows('follows').find(r => r.follower_id === payload.follower_id && r.following_id === payload.following_id);
        if (follow) deleteRow('follows', 'id', follow.id);
        response.success = true;
        break;
      case 'GET_MESSAGES':
        response.data = getRows('messages').filter(r => 
          (r.sender_id === payload.user1 && r.receiver_id === payload.user2) ||
          (r.sender_id === payload.user2 && r.receiver_id === payload.user1)
        );
        response.success = true;
        break;
      case 'SEND_MESSAGE':
        payload.id = Utilities.getUuid();
        payload.created_at = new Date().toISOString();
        payload.is_read = false;
        response.data = appendRow('messages', payload);
        response.success = true;
        break;
      default:
        throw new Error("Unknown command: " + cmd);
    }
  } catch (err) {
    response.error = err.message;
  }

  return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
}

// --- HELPER FUNCTIONS ---

function getRows(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  return data.map(row => {
    const obj = {};
    headers.forEach((h, i) => {
      let val = row[i];
      if (h === 'tags' && typeof val === 'string' && val.startsWith('[')) {
        try { val = JSON.parse(val); } catch(e) {}
      }
      if (h === 'is_read') val = (val === true || val === "TRUE" || val === 1);
      obj[h] = val;
    });
    return obj;
  });
}

function appendRow(sheetName, obj) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const row = headers.map(h => {
    let val = obj[h];
    if (Array.isArray(val)) return JSON.stringify(val);
    return val !== undefined ? val : "";
  });
  sheet.appendRow(row);
  return obj;
}

function upsertRow(sheetName, keyCol, obj) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  const keyIdx = headers.indexOf(keyCol);
  
  let rowIdx = -1;
  for (let i = 0; i < data.length; i++) {
    if (data[i][keyIdx] == obj[keyCol]) {
      rowIdx = i + 2; 
      break;
    }
  }

  const row = headers.map(h => {
    let val = obj[h];
    if (Array.isArray(val)) return JSON.stringify(val);
    return val !== undefined ? val : "";
  });

  if (rowIdx !== -1) {
    sheet.getRange(rowIdx, 1, 1, headers.length).setValues([row]);
  } else {
    sheet.appendRow(row);
  }
  return obj;
}

function deleteRow(sheetName, keyCol, keyValue) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const keyIdx = headers.indexOf(keyCol);
  
  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][keyIdx] == keyValue) {
      sheet.deleteRow(i + 1);
    }
  }
}

function updateRow(sheetName, keyCol, keyValue, updates) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const keyIdx = headers.indexOf(keyCol);
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][keyIdx] == keyValue) {
      for (const [k, v] of Object.entries(updates)) {
        const colIdx = headers.indexOf(k);
        if (colIdx !== -1) {
          let val = v;
          if (Array.isArray(val)) val = JSON.stringify(val);
          sheet.getRange(i + 1, colIdx + 1).setValue(val);
        }
      }
    }
  }
}
