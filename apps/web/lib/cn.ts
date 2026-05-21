// Simple cn implementation without clsx dependency
type ClassValue = string | boolean | null | undefined | Record<string, boolean> | ClassValue[];

function clsx(...inputs: ClassValue[]): string {
  const classes: string[] = [];
  
  for (const input of inputs) {
    if (!input) continue;
    
    if (typeof input === 'string') {
      classes.push(input);
    } else if (typeof input === 'object' && !Array.isArray(input)) {
      for (const [key, value] of Object.entries(input)) {
        if (value) classes.push(key);
      }
    } else if (Array.isArray(input)) {
      const inner = clsx(...input);
      if (inner) classes.push(inner);
    }
  }
  
  return classes.join(' ');
}

/**
 * Merge class names safely
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(...inputs);
}
