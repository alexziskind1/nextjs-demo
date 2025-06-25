// Client-side API service
export class HelloApiService {
  private static readonly API_BASE = '/api';
  
  static async sayHello(name: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await fetch(`${this.API_BASE}/hello`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        return { success: true, message: data.message };
      } else {
        return { success: false, error: data.error || 'Something went wrong' };
      }
    } catch (error) {
      return { success: false, error: 'Failed to connect to the server' };
    }
  }
  
  // Client-side validation (for immediate feedback)
  static validateNameClient(name: string): { isValid: boolean; error?: string } {
    if (!name.trim()) {
      return { isValid: false, error: 'Please enter a name' };
    }
    
    if (name.trim().length > 50) {
      return { isValid: false, error: 'Name must be less than 50 characters' };
    }
    
    return { isValid: true };
  }
}
