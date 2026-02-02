# 🌸 wxifu Immersive Platform

Welcome to **wxifu** — The premier social stage for anime artwork, cosplay, and digital assets. Powered by a lightweight, high-performance **Google Sheets + Apps Script** backend.

Official URL: [https://wxifu.vercel.app/](https://wxifu.vercel.app/)

## ✨ About
wxifu is a fully-featured **Social Media Platform** built for artists and fans. It allows creators to upload, manage, and monetize their content while enabling fans to follow, chat, and interact in real-time. Built with a cyberpunk aesthetic, it prioritizes a premium user experience for high-resolution art and video consumption.

---

## 🛠 Quick Start: Backend Setup (Google Sheets)

To run this project, you must set up your own database using Google Sheets. It takes less than 2 minutes.

### 1. Create your Database
1. Go to [sheets.new](https://sheets.new) to create a new spreadsheet. Name it `wxifu_db`.
2. Go to **Extensions > Apps Script**.
3. Delete any code in the editor and paste the **Backend Code** provided below.

### 2. Initial Setup
1. In the Apps Script editor, look at the toolbar and select the **`setup`** function from the dropdown.
2. Click **Run**. 
3. **Review Permissions**: Click "Review Permissions", select your Google account, click "Advanced", and then "Go to wxifu_db (unsafe)". Click "Allow".
   * *This creates all the necessary tabs (profiles, media, likes, etc.) in your sheet automatically.*

### 3. Deploy as Web App
1. Click **Deploy > New Deployment**.
2. Select type: **Web App**.
3. Set **Description** to: `wxifu API`.
4. Set **Execute as**: `Me`.
5. Set **Who has access**: `Anyone`. **(CRITICAL for the app to work)**.
6. Click **Deploy**.
7. Copy the **Web App URL** (ends in `/exec`).

### 4. Connect Frontend
1. Open `lib/client.ts` in your code editor.
2. Replace `PASTE_YOUR_GAS_WEBAPP_URL_HERE` with the URL you just copied.

---

## 📜 Backend Code Snippet
*Copy this entire block into your Apps Script editor:*

```javascript
/**
 * WXIFU BACKEND (GOOGLE APPS SCRIPT)
 */

const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = {
    'profiles': ['id', 'name', 'avatar', 'bio', 'coins', 'frame', 'updated_at'],
    'media': ['id', 'created_at', 'user_id', 'type', 'src', 'videoSrc', 'description', 'category', 'tags', 'is_premium', 'price', 'author', 'author_avatar'],
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
        const existing = getRows('likes').find(r => r.media_id === payload.media_id && r.user_id === payload.user_id);
        if (existing) {
          deleteRow('likes', 'id', existing.id);
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
      case 'GET_UNLOCKED':
        response.data = getRows('unlocked_media').filter(r => r.user_id === payload.user_id);
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
  } catch (err) {
    response.error = err.message;
  }

  return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
}

function getRows(sheetName) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
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
      if (h === 'coins' || h === 'price') val = Number(val) || 0;
      if (h === 'is_premium' || h === 'is_read') val = (val === true || val === "TRUE" || val === 1);
      obj[h] = val;
    });
    return obj;
  });
}

function appendRow(sheetName, obj) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
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
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
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

function updateRow(sheetName, keyCol, keyValue, updates) {
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
```

---

## 🚀 Key Features

### 🎨 Immersive Gallery
*   **Masonry Grid**: Optimized layout for mixed portrait/landscape artwork.
*   **TikTok-Style Feed**: Vertical scroll mode with immersive video playback.
*   **Deep Zoom**: Full resolution inspection with pinch-to-zoom.

### 👥 Social System
*   **Direct Messaging**: Real-time chat with other users.
*   **Follow System**: Tailor your feed by following top creators.
*   **Gifting**: Send coins to support your favorite artists.

### 💰 Economy & Monetization
*   **Coin Market**: Purchase and spend coins on premium assets.
*   **Avatar Decorations**: Custom animated frames for your profile.
*   **Premium Vaults**: Unlock exclusive content using the platform currency.

## 💻 Tech Stack
*   **Frontend**: React 19, TypeScript, Vite
*   **Styling**: Tailwind CSS (Cyberpunk Dark Theme)
*   **Database**: Google Sheets (NoSQL-style implementation)
*   **API**: Google Apps Script (GAS)
