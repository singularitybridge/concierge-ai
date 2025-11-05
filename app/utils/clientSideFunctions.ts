/**
 * Client-side functions that can be called by VAPI voice assistant
 * These functions execute directly in the browser without server round-trips
 */

export interface ClientFunctionContext {
  showModal: (params: {
    title: string;
    message: string;
    type?: 'success' | 'error' | 'info' | 'warning';
    actions?: Array<{
      label: string;
      onClick: () => void;
      variant?: 'primary' | 'secondary' | 'danger';
    }>;
  }) => void;
  endCall?: () => void; // End the current voice call
  router?: any; // Next.js router if available
  updateState?: (key: string, value: any) => void;
}

export type ClientFunctionHandler = (
  params: any,
  context: ClientFunctionContext
) => Promise<string> | string;

/**
 * Registry of client-side functions
 */
export const clientSideFunctions: Record<string, ClientFunctionHandler> = {
  /**
   * Show a modal/popup with custom content
   */
  show_modal: async (params, context) => {
    const { title, message, type = 'info' } = params;

    context.showModal({
      title,
      message,
      type,
      actions: [
        {
          label: 'Got it',
          onClick: () => console.log('Modal acknowledged'),
          variant: 'primary'
        }
      ]
    });

    return `Showed ${type} modal: ${title}`;
  },

  /**
   * Show a confirmation dialog
   */
  show_confirmation: async (params, context) => {
    const { title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel' } = params;

    return new Promise((resolve) => {
      context.showModal({
        title,
        message,
        type: 'warning',
        actions: [
          {
            label: cancelLabel,
            onClick: () => resolve(`User clicked ${cancelLabel}`),
            variant: 'secondary'
          },
          {
            label: confirmLabel,
            onClick: () => resolve(`User clicked ${confirmLabel}`),
            variant: 'primary'
          }
        ]
      });
    });
  },

  /**
   * Navigate to a page
   */
  navigate_to: async (params, context) => {
    const { path } = params;

    if (typeof window !== 'undefined') {
      window.location.href = path;
      return `Navigating to ${path}`;
    }

    return 'Navigation not available';
  },

  /**
   * Open a page in a new tab
   */
  open_in_new_tab: async (params) => {
    const { url } = params;

    if (typeof window !== 'undefined') {
      window.open(url, '_blank');
      return `Opened ${url} in new tab`;
    }

    return 'Could not open new tab';
  },

  /**
   * Click a button by selector
   */
  click_button: async (params) => {
    const { selector } = params;

    if (typeof document !== 'undefined') {
      const element = document.querySelector(selector);
      if (element instanceof HTMLElement) {
        element.click();
        return `Clicked button: ${selector}`;
      }
      return `Button not found: ${selector}`;
    }

    return 'Document not available';
  },

  /**
   * Show a success notification
   */
  show_success: async (params, context) => {
    const { message } = params;

    context.showModal({
      title: 'Success',
      message,
      type: 'success'
    });

    return `Showed success message: ${message}`;
  },

  /**
   * Show an error notification
   */
  show_error: async (params, context) => {
    const { message } = params;

    context.showModal({
      title: 'Error',
      message,
      type: 'error'
    });

    return `Showed error message: ${message}`;
  },

  /**
   * End the current voice call
   */
  end_call: async (params, context) => {
    if (context.endCall) {
      context.endCall();
      return 'Ending call now. Goodbye!';
    }
    return 'Unable to end call - no call active';
  },

  /**
   * Get current page information
   */
  get_current_page: async () => {
    if (typeof window !== 'undefined') {
      return `Current page: ${window.location.pathname}`;
    }
    return 'Page information not available';
  },

  /**
   * Scroll to top of page
   */
  scroll_to_top: async () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return 'Scrolled to top';
    }
    return 'Scroll not available';
  },

  /**
   * Scroll to element
   */
  scroll_to_element: async (params) => {
    const { selector } = params;

    if (typeof document !== 'undefined') {
      const element = document.querySelector(selector);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return `Scrolled to ${selector}`;
      }
      return `Element not found: ${selector}`;
    }

    return 'Scroll not available';
  },

  /**
   * Copy text to clipboard
   */
  copy_to_clipboard: async (params) => {
    const { text } = params;

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return `Copied to clipboard: ${text}`;
    }

    return 'Clipboard not available';
  },

  /**
   * Get local storage item
   */
  get_storage_item: async (params) => {
    const { key } = params;

    if (typeof localStorage !== 'undefined') {
      const value = localStorage.getItem(key);
      return value ? `Storage value for ${key}: ${value}` : `No value found for ${key}`;
    }

    return 'Local storage not available';
  },

  /**
   * Set local storage item
   */
  set_storage_item: async (params) => {
    const { key, value } = params;

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
      return `Stored ${key} = ${value}`;
    }

    return 'Local storage not available';
  },

  /**
   * Reload the page
   */
  reload_page: async () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
      return 'Reloading page';
    }

    return 'Reload not available';
  },

  /**
   * Go back in browser history
   */
  go_back: async () => {
    if (typeof window !== 'undefined' && window.history) {
      window.history.back();
      return 'Going back';
    }

    return 'History navigation not available';
  },

  /**
   * Open workspace file (specific to this app)
   */
  open_workspace_file: async (params) => {
    const { path, agentId = 'integration-expert' } = params;

    if (typeof window !== 'undefined') {
      window.location.href = `/workspace?agent=${agentId}&file=${encodeURIComponent(path)}`;
      return `Opening workspace file: ${path}`;
    }

    return 'Navigation not available';
  }
};

/**
 * Execute a client-side function by name
 */
export async function executeClientFunction(
  functionName: string,
  params: any,
  context: ClientFunctionContext
): Promise<string> {
  const handler = clientSideFunctions[functionName];

  if (!handler) {
    throw new Error(`Unknown function: ${functionName}`);
  }

  try {
    const result = await handler(params, context);
    return result;
  } catch (error) {
    console.error(`Error executing ${functionName}:`, error);
    throw error;
  }
}

/**
 * Get list of available client-side functions
 */
export function getAvailableFunctions(): string[] {
  return Object.keys(clientSideFunctions);
}
