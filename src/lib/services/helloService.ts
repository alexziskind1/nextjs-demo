// Business logic service
export class HelloService {
  static validateName(name: string): { isValid: boolean; error?: string } {
    if (!name || typeof name !== 'string') {
      return { isValid: false, error: 'Name is required' };
    }
    
    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
      return { isValid: false, error: 'Name cannot be empty' };
    }
    
    if (trimmedName.length > 50) {
      return { isValid: false, error: 'Name must be less than 50 characters' };
    }
    
    // Check for invalid characters
    if (!/^[a-zA-Z\s\-']+$/.test(trimmedName)) {
      return { isValid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
    }
    
    return { isValid: true };
  }
  
  static formatHelloMessage(name: string): string {
    const trimmedName = name.trim();
    // Capitalize first letter of each word
    const formattedName = trimmedName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    
    return `Hello ${formattedName}!`;
  }
  
  static async processHelloRequest(name: string): Promise<{ success: boolean; message?: string; error?: string }> {
    // Validate input
    const validation = this.validateName(name);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }
    
    try {
      // Business logic: format the hello message
      const message = this.formatHelloMessage(name);
      
      // Here you could add more business logic:
      // - Log the interaction
      // - Save to database
      // - Call external services
      // - Apply business rules
      
      return { success: true, message };
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' };
    }
  }
}
