import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

/**
 * P0-5: Mock Data Detection Test
 * 
 * Scans the codebase for hardcoded mock data that should not be
 * present in production builds.
 */

// Patterns that indicate hardcoded mock data
const FORBIDDEN_PATTERNS: Array<{ pattern: RegExp; description: string }> = [
  { 
    pattern: /mockData\s*=\s*\[\s*\{[\s\S]{10,}/m, 
    description: 'Mock data array with objects' 
  },
  { 
    pattern: /Mock\w+\s*=\s*\{[^}]+name\s*:/m, 
    description: 'Mock object with name property' 
  },
  { 
    pattern: /testData\s*=\s*\[\s*\{[\s\S]{10,}/m, 
    description: 'Test data array with objects' 
  },
  { 
    pattern: /"Max Mustermann"/i, 
    description: 'German placeholder name' 
  },
  { 
    pattern: /"Erika Musterfrau"/i, 
    description: 'German placeholder name' 
  },
  { 
    pattern: /"John Doe"/i, 
    description: 'English placeholder name' 
  },
  { 
    pattern: /"Jane Doe"/i, 
    description: 'English placeholder name' 
  },
  { 
    pattern: /test@example\.com/i, 
    description: 'Test email address' 
  },
  { 
    pattern: /demo@.*\.com/i, 
    description: 'Demo email address' 
  },
  { 
    pattern: /fallback\s*:\s*\[\s*\{[^}]+name/im, 
    description: 'Fallback array with data objects' 
  },
  { 
    pattern: /DEMO_DATA\s*=/i, 
    description: 'Demo data constant' 
  },
  { 
    pattern: /SAMPLE_DATA\s*=/i, 
    description: 'Sample data constant' 
  },
  { 
    pattern: /MOCK_EMPLOYEES\s*=/i, 
    description: 'Mock employees constant' 
  },
  { 
    pattern: /const\s+employees\s*=\s*\[\s*\{[^}]+firstName/m, 
    description: 'Hardcoded employees array' 
  },
];

// Patterns that are allowed (empty arrays, type definitions, etc.)
const ALLOWED_PATTERNS: RegExp[] = [
  /=\s*\[\s*\]/,                           // Empty arrays
  /:\s*\[\s*\]/,                           // Empty array type/value
  /Mock.*\[\s*\]/,                         // Mock = []
  /\.mock\s*\(/,                           // Jest/Vitest mock calls
  /vi\.mock\s*\(/,                         // Vitest mock
  /jest\.mock\s*\(/,                       // Jest mock
  /type\s+\w+\s*=\s*\{/,                   // Type definitions
  /interface\s+\w+\s*\{/,                  // Interface definitions
  /\/\/.*mock/i,                           // Comments mentioning mock
  /\/\*[\s\S]*mock[\s\S]*\*\//i,           // Multi-line comments
  /\.test\.ts/,                            // Test file references
  /\.spec\.ts/,                            // Spec file references
];

// Directories to scan
const SCAN_DIRECTORIES = [
  'src/components',
  'src/hooks',
  'src/pages',
  'src/services',
  'src/utils',
];

// Files/directories to exclude
const EXCLUDED_PATHS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  'tests',
  '__tests__',
  '*.test.ts',
  '*.test.tsx',
  '*.spec.ts',
  '*.spec.tsx',
  'mock',
  'mocks',
  '__mocks__',
];

/**
 * Recursively get all TypeScript/JavaScript files in a directory
 */
function getFilesRecursively(dir: string): string[] {
  const files: string[] = [];
  
  if (!fs.existsSync(dir)) {
    return files;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    // Skip excluded paths
    if (EXCLUDED_PATHS.some((ex) => 
      entry.name.includes(ex) || fullPath.includes(ex)
    )) {
      continue;
    }

    if (entry.isDirectory()) {
      files.push(...getFilesRecursively(fullPath));
    } else if (
      entry.isFile() && 
      (entry.name.endsWith('.ts') || 
       entry.name.endsWith('.tsx') || 
       entry.name.endsWith('.js') || 
       entry.name.endsWith('.jsx'))
    ) {
      // Skip test files
      if (entry.name.includes('.test.') || entry.name.includes('.spec.')) {
        continue;
      }
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Check if content matches any allowed pattern (indicating it's okay)
 */
function isAllowedMockPattern(content: string, matchedText: string): boolean {
  // Check if the match is in a comment
  const lines = content.split('\n');
  for (const line of lines) {
    if (line.includes(matchedText)) {
      // Check if line is a comment
      const trimmed = line.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) {
        return true;
      }
    }
  }

  return ALLOWED_PATTERNS.some((pattern) => pattern.test(matchedText));
}

describe('P0-5: Mock Data Detection Test', () => {
  describe('Component Mock Data Check', () => {
    it('No hardcoded mock data in components', () => {
      const violations: Array<{ file: string; pattern: string; match: string }> = [];
      const files = getFilesRecursively('src/components');

      for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');

        for (const { pattern, description } of FORBIDDEN_PATTERNS) {
          const match = content.match(pattern);
          if (match && !isAllowedMockPattern(content, match[0])) {
            violations.push({
              file: file.replace(process.cwd(), ''),
              pattern: description,
              match: match[0].substring(0, 100) + '...',
            });
          }
        }
      }

      if (violations.length > 0) {
        console.error('Mock data violations found:');
        violations.forEach((v) => {
          console.error(`  ${v.file}: ${v.pattern}`);
          console.error(`    Match: ${v.match}`);
        });
      }

      expect(violations).toEqual([]);
    });
  });

  describe('Hooks Mock Data Check', () => {
    it('No hardcoded mock data in hooks', () => {
      const violations: Array<{ file: string; pattern: string }> = [];
      const files = getFilesRecursively('src/hooks');

      for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');

        for (const { pattern, description } of FORBIDDEN_PATTERNS) {
          if (pattern.test(content) && !ALLOWED_PATTERNS.some((p) => p.test(content))) {
            violations.push({
              file: file.replace(process.cwd(), ''),
              pattern: description,
            });
          }
        }
      }

      expect(violations).toEqual([]);
    });
  });

  describe('Pages Mock Data Check', () => {
    it('No hardcoded mock data in pages', () => {
      const violations: Array<{ file: string; pattern: string }> = [];
      const files = getFilesRecursively('src/pages');

      for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');

        for (const { pattern, description } of FORBIDDEN_PATTERNS) {
          if (pattern.test(content) && !ALLOWED_PATTERNS.some((p) => p.test(content))) {
            violations.push({
              file: file.replace(process.cwd(), ''),
              pattern: description,
            });
          }
        }
      }

      expect(violations).toEqual([]);
    });
  });

  describe('Services Mock Data Check', () => {
    it('No hardcoded mock data in services', () => {
      const violations: Array<{ file: string; pattern: string }> = [];
      const files = getFilesRecursively('src/services');

      for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');

        for (const { pattern, description } of FORBIDDEN_PATTERNS) {
          if (pattern.test(content) && !ALLOWED_PATTERNS.some((p) => p.test(content))) {
            violations.push({
              file: file.replace(process.cwd(), ''),
              pattern: description,
            });
          }
        }
      }

      expect(violations).toEqual([]);
    });
  });

  describe('Fallback Data Check', () => {
    it('No fallback arrays with mock data objects', () => {
      const fallbackPattern = /(?:fallback|default)\s*(?::|=)\s*\[\s*\{[^}]+(?:name|email|id)[^}]+\}/gim;
      const violations: string[] = [];

      for (const dir of SCAN_DIRECTORIES) {
        const files = getFilesRecursively(dir);
        
        for (const file of files) {
          const content = fs.readFileSync(file, 'utf-8');
          
          if (fallbackPattern.test(content)) {
            // Reset regex state
            fallbackPattern.lastIndex = 0;
            violations.push(file.replace(process.cwd(), ''));
          }
        }
      }

      if (violations.length > 0) {
        console.error('Files with fallback mock data:', violations);
      }

      expect(violations).toEqual([]);
    });
  });

  describe('Empty State Verification', () => {
    it('Data arrays should be initialized as empty or from API', () => {
      // Pattern for data arrays that are not empty and not from API
      const dataArrayPattern = /(?:employees|users|items|data)\s*=\s*\[\s*\{[^}]+\}/gim;
      const apiPatterns = [
        /useQuery/,
        /useMutation/,
        /supabase/,
        /fetch\(/,
        /axios/,
        /\.from\(/,
      ];
      
      const violations: string[] = [];

      for (const dir of SCAN_DIRECTORIES) {
        const files = getFilesRecursively(dir);
        
        for (const file of files) {
          const content = fs.readFileSync(file, 'utf-8');
          
          if (dataArrayPattern.test(content)) {
            // Check if file also uses API calls
            const usesApi = apiPatterns.some((p) => p.test(content));
            
            if (!usesApi) {
              dataArrayPattern.lastIndex = 0;
              violations.push(file.replace(process.cwd(), ''));
            }
          }
          
          dataArrayPattern.lastIndex = 0;
        }
      }

      // This is a warning, not a blocking error
      if (violations.length > 0) {
        console.warn('Files with hardcoded data arrays (review manually):', violations);
      }
    });
  });
});
