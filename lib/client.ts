/**
 * WXIFU CLIENT (GAS VERSION)
 * Replace the GAS_WEBAPP_URL with your actual URL after deploying the script.
 */
const GAS_WEBAPP_URL = 'PASTE_YOUR_GAS_WEBAPP_URL_HERE';

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

// Mock the compatibility layer for minimal friction in refactoring
export const supabase: any = {
  auth: {
    // We maintain a local mock of the auth session
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
      // Simulation of a successful login
      const mockUser = {
        id: 'user-' + Math.random().toString(36).substring(2, 10),
        email: 'user@wxifu.app',
        user_metadata: {
          full_name: 'Wxifu User',
          avatar_url: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?q=80&w=100&auto=format&fit=crop',
          bio: 'Wxifu aesthetic lover.'
        }
      };
      const session = { user: mockUser };
      localStorage.setItem('gas_auth_session', JSON.stringify(session));
      window.dispatchEvent(new Event('storage'));
      
      // Auto-upsert profile on login
      await gasRequest('UPSERT_PROFILE', {
          id: mockUser.id,
          name: mockUser.user_metadata.full_name,
          avatar: mockUser.user_metadata.avatar_url,
          bio: mockUser.user_metadata.bio,
          coins: 100,
          frame: 'none',
          updated_at: new Date().toISOString()
      });

      return { error: null };
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
    const chain: any = {
      select: () => chain,
      order: () => chain,
      eq: () => chain,
      in: () => chain,
      update: () => chain,
      single: () => Promise.resolve({ data: null, error: null }),
      then: (resolve: any) => Promise.resolve({ data: [], error: null }).then(resolve)
    };
    return chain;
  },
  channel: (name: string) => ({
    on: (event: string, filter: any, callback: any) => ({
      subscribe: () => ({})
    }),
    subscribe: () => ({})
  }),
  removeChannel: (channel: any) => {},
  functions: {
    invoke: async (name: string, options: any) => ({ data: null, error: null })
  }
};