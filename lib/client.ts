/**
 * WXIFU CLIENT (GAS VERSION)
 * Replace the GAS_WEBAPP_URL with your actual URL after deploying the script.
 */
const GAS_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbzYyxn3Qv9qg3MBZxpt-iZo8OsHQMSdsNpRBK4AW1lOTfXOzvIJ30_htzAgJogtBKwVfA/exec';
const GOOGLE_CLIENT_ID = '1093411544368-g2prbhj609e0s8e2lhcp2jtui1kclran.apps.googleusercontent.com';

export const gasRequest = async (command: string, payload: any = {}) => {
  if (GAS_WEBAPP_URL.includes('PASTE_YOUR')) {
    console.error("GAS URL NOT CONFIGURED. Please deploy BackEndCode.ts and update lib/client.ts");
    return { success: false, error: "Backend not configured" };
  }

  try {
    const response = await fetch(GAS_WEBAPP_URL, {
      method: 'POST',
      body: JSON.stringify({ command, payload }),
    });
    const result = await response.json();
    return result;
  } catch (err: any) {
    console.error("GAS Request Error:", err);
    return { success: false, error: err.message };
  }
};

// Helper to decode Google JWT
const decodeJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

// Mock the compatibility layer for minimal friction in refactoring
export const supabase: any = {
  auth: {
    getSession: async () => {
      const stored = localStorage.getItem('gas_auth_session');
      return { data: { session: stored ? JSON.parse(stored) : null } };
    },
    onAuthStateChange: (callback: any) => {
      const handleAuth = () => {
        const stored = localStorage.getItem('gas_auth_session');
        callback('SIGNED_IN', stored ? JSON.parse(stored) : null);
      };
      window.addEventListener('storage', handleAuth);
      return { data: { subscription: { unsubscribe: () => window.removeEventListener('storage', handleAuth) } } };
    },
    signInWithOAuth: async ({ provider }: any) => {
      if (provider !== 'google') return { error: { message: 'Only Google is supported' } };

      return new Promise((resolve) => {
        const client = (window as any).google?.accounts.id;
        if (!client) {
          console.error("Google GIS library not loaded");
          resolve({ error: { message: "Auth library not loaded" } });
          return;
        }

        client.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response: any) => {
            const payload = decodeJwt(response.credential);
            if (!payload) {
              resolve({ error: { message: "Failed to decode credential" } });
              return;
            }

            const mockUser = {
              id: payload.sub,
              email: payload.email,
              user_metadata: {
                full_name: payload.name,
                avatar_url: payload.picture,
                bio: ''
              }
            };
            
            const session = { user: mockUser, access_token: response.credential };
            localStorage.setItem('gas_auth_session', JSON.stringify(session));
            window.dispatchEvent(new Event('storage'));
            
            await gasRequest('UPSERT_PROFILE', {
                id: mockUser.id,
                name: mockUser.user_metadata.full_name,
                avatar: mockUser.user_metadata.avatar_url,
                bio: '',
                coins: 100,
                frame: 'none',
                updated_at: new Date().toISOString()
            });

            resolve({ data: session, error: null });
          },
        });

        // Use standard button render for reliability
        const parentElement = document.createElement('div');
        parentElement.style.display = 'none';
        document.body.appendChild(parentElement);
        (window as any).google.accounts.id.renderButton(parentElement, { theme: 'outline', size: 'large' });
        const button = parentElement.querySelector('div[role="button"]') as HTMLElement;
        if (button) button.click();
        setTimeout(() => { if (parentElement.parentNode) document.body.removeChild(parentElement); }, 1000);
      });
    },
    signOut: async () => {
      localStorage.removeItem('gas_auth_session');
      window.dispatchEvent(new Event('storage'));
      return { error: null };
    },
    updateUser: async ({ data }: any) => {
      const stored = localStorage.getItem('gas_auth_session');
      if (stored) {
        const session = JSON.parse(stored);
        session.user.user_metadata = { ...session.user.user_metadata, ...data };
        localStorage.setItem('gas_auth_session', JSON.stringify(session));
        return { data: session, error: null };
      }
      return { data: null, error: 'No session' };
    },
    getUser: async () => {
      const stored = localStorage.getItem('gas_auth_session');
      return { data: { user: stored ? JSON.parse(stored).user : null } };
    }
  },
  from: (table: string) => {
    let _table = table;
    let _select: string | null = null;
    let _filters: any[] = [];
    
    const chain: any = {
      select: (cols: string) => { _select = cols; return chain; },
      order: (col: string, opts: any) => chain,
      eq: (col: string, val: any) => { _filters.push({ col, val }); return chain; },
      in: (col: string, vals: any[]) => chain,
      update: (updates: any) => chain,
      single: () => {
          // Returning a promise that resolves with data from GAS
          return chain.then((res: any) => {
              const data = Array.isArray(res.data) ? res.data[0] : res.data;
              return { data: data || null, error: res.error };
          });
      },
      // This is the magic part: make the chain awaitable
      then: async (onfulfilled: any) => {
        const cmd = `GET_${_table.toUpperCase()}`;
        const res = await gasRequest(cmd);
        
        let filteredData = res.data || [];
        // Basic filter support for the mock
        if (_filters.length > 0) {
            filteredData = filteredData.filter((row: any) => 
                _filters.every(f => row[f.col] === f.val)
            );
        }
        
        const result = { data: filteredData, error: res.error ? { message: res.error } : null };
        return onfulfilled ? Promise.resolve(onfulfilled(result)) : result;
      }
    };
    return chain;
  },
  channel: (name: string) => {
    const channelObj: any = {
      on: (event: string, filter: any, callback: any) => channelObj,
      subscribe: () => ({ unsubscribe: () => {} })
    };
    return channelObj;
  },
  removeChannel: (channel: any) => {},
  functions: {
    invoke: async (name: string, options: any) => ({ data: null, error: null })
  }
};