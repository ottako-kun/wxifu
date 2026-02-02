/**
 * WXIFU BACKEND (GOOGLE APPS SCRIPT)
 * 1. Create a new Google Sheet.
 * 2. Go to Extensions > Apps Script.
 * 3. Paste this code.
 * 4. Run the 'setup' function once.
 * 5. Deploy > New Deployment > Web App (Execute as Me, Access as Anyone).
 * 6. Copy the URL and paste it into lib/client.ts in your project.
 */

// Fixed: Added declarations for GAS globals
declare var SpreadsheetApp: any;
declare var Utilities: any;
declare var ContentService: any;

const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = {
    'profiles': ['id', 'name', 'avatar', 'bio', 'coins', 'frame', 'updated_at'],
    'media': ['id', 'created_at', 'user_id', 'type', 'src', 'videoSrc', 'description', 'category', 'tags', 'is_premium', 'price'],
    'likes': ['id', 'media_id', 'user_id', 'created_at'],
    'comments': ['id', 'media_id', 'user_id', 'content', 'author_name', 'author_avatar', 'created_at'],
    'follows': ['id', 'follower_id', 'following_id', 'created_at'],
    'messages': ['id', 'sender_id', 'receiver_id', 'content', 'created_at', 'is_read'],
    'unlocked_media': ['id', 'user_id', 'media_id', 'created_at']
  };

  for (const [name, headers] of Object.entries(sheets)) {
    let sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#f3f3f3");
      sheet.setFrozenRows(1);
    }
  }
  return "Setup Complete. WXIFU Tables Initialized.";
}

function doPost(e: any) {
  const response: any = { success: false, data: null, error: null };
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
        response.data = getRows('likes').filter((r: any) => r.media_id === payload.media_id);
        response.success = true;
        break;
      case 'TOGGLE_LIKE':
        const existing = getRows('likes').find((r: any) => r.media_id === payload.media_id && r.user_id === payload.user_id);
        if (existing) {
          deleteRow('likes', 'id', (existing as any).id);
          response.data = { liked: false };
        } else {
          const newLike = { id: Utilities.getUuid(), ...payload, created_at: new Date().toISOString() };
          appendRow('likes', newLike);
          response.data = { liked: true };
        }
        response.success = true;
        break;
      case 'GET_COMMENTS':
        response.data = getRows('comments').filter((r: any) => r.media_id === payload.media_id);
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
        const follow = getRows('follows').find((r: any) => r.follower_id === payload.follower_id && r.following_id === payload.following_id);
        if (follow) deleteRow('follows', 'id', (follow as any).id);
        response.success = true;
        break;
      case 'GET_MESSAGES':
        response.data = getRows('messages').filter((r: any) => 
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
      case 'GET_UNLOCKED':
        response.data = getRows('unlocked_media').filter((r: any) => r.user_id === payload.user_id);
        response.success = true;
        break;
      case 'UNLOCK_MEDIA':
        const unlock = { id: Utilities.getUuid(), ...payload, created_at: new Date().toISOString() };
        appendRow('unlocked_media', unlock);
        response.success = true;
        break;
      default:
        throw new Error("Unknown command: " + cmd);
    }
  } catch (err: any) {
    response.error = err.message;
  }

  return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
}

// --- HELPER FUNCTIONS ---

function getRows(sheetName: string) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  return data.map((row: any) => {
    const obj: any = {};
    headers.forEach((h: string, i: number) => {
      let val = row[i];
      // Handle tags array (stored as JSON string)
      if (h === 'tags' && typeof val === 'string' && val.startsWith('[')) {
        try { val = JSON.parse(val); } catch(e) {}
      }
      // Handle numeric coins
      if (h === 'coins' || h === 'price') val = Number(val) || 0;
      // Handle boolean
      if (h === 'is_premium' || h === 'is_read') val = (val === true || val === "TRUE" || val === 1);
      obj[h] = val;
    });
    return obj;
  });
}

function appendRow(sheetName: string, obj: any) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const row = headers.map((h: string) => {
    let val = obj[h];
    if (Array.isArray(val)) return JSON.stringify(val);
    return val !== undefined ? val : "";
  });
  sheet.appendRow(row);
  return obj;
}

function upsertRow(sheetName: string, keyCol: string, obj: any) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  const keyIdx = headers.indexOf(keyCol);
  
  let rowIdx = -1;
  for (let i = 0; i < data.length; i++) {
    if (data[i][keyIdx] == obj[keyCol]) {
      rowIdx = i + 2; // +1 for header, +1 for 1-based index
      break;
    }
  }

  const row = headers.map((h: string) => {
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

function deleteRow(sheetName: string, keyCol: string, keyValue: any) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const keyIdx = headers.indexOf(keyCol);
  
  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][keyIdx] == keyValue) {
      sheet.deleteRow(i + 1);
    }
  }
}

function updateRow(sheetName: string, keyCol: string, keyValue: any, updates: any) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
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