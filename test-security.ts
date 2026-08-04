// Mock browser environment for the test in Node.js
(global as any).localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {}
};

(global as any).document = {
  getElementById: () => null,
  documentElement: {
    style: {
      setProperty: () => {}
    }
  }
};

(global as any).chrome = {
  i18n: {
    getMessage: () => ""
  }
};

async function main() {
  const { sanitizeUrl, sanitizeIconUrl } = await import('./src/core/boot/shortcuts-render');

  interface TestCase {
    input: string;
    expected: string;
    description: string;
  }

  const urlTestCases: TestCase[] = [
    {
      input: 'https://example.com',
      expected: 'https://example.com',
      description: 'Standard HTTPS URL'
    },
    {
      input: 'http://localhost:3000',
      expected: 'http://localhost:3000',
      description: 'Standard HTTP localhost URL'
    },
    {
      input: 'javascript:alert(1)',
      expected: 'about:blank',
      description: 'Simple javascript: XSS payload'
    },
    {
      input: '   javascript:alert(1)   ',
      expected: 'about:blank',
      description: 'javascript: payload with leading/trailing whitespaces'
    },
    {
      input: 'java\tscript:alert(1)',
      expected: 'about:blank',
      description: 'javascript: payload with horizontal tab'
    },
    {
      input: 'java\nscript:alert(1)',
      expected: 'about:blank',
      description: 'javascript: payload with newline'
    },
    {
      input: 'java\rscript:alert(1)',
      expected: 'about:blank',
      description: 'javascript: payload with carriage return'
    },
    {
      input: 'JAVASCRIPT:alert(1)',
      expected: 'about:blank',
      description: 'Uppercase JAVASCRIPT: protocol'
    },
    {
      input: 'data:text/html,<html>',
      expected: 'about:blank',
      description: 'Dangerous data: protocol'
    },
    {
      input: 'vbscript:msgbox("hello")',
      expected: 'about:blank',
      description: 'Dangerous vbscript: protocol'
    },
    {
      input: 'file:///etc/passwd',
      expected: 'about:blank',
      description: 'Dangerous file: protocol'
    },
    {
      input: '',
      expected: 'about:blank',
      description: 'Empty string input'
    },
    {
      input: 'https://example.com/some-path?q=javascript:alert(1)',
      expected: 'https://example.com/some-path?q=javascript:alert(1)',
      description: 'Safe URL containing javascript: as parameter'
    }
  ];

  const iconUrlTestCases: TestCase[] = [
    {
      input: 'https://example.com/icon.png',
      expected: 'https://example.com/icon.png',
      description: 'Standard HTTP/S icon URL'
    },
    {
      input: 'javascript:alert(1)',
      expected: '',
      description: 'Malicious javascript: icon URL'
    },
    {
      input: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      expected: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      description: 'Allowed data:image/png URI'
    },
    {
      input: 'data:text/html,<html>',
      expected: '',
      description: 'Disallowed data:text/html URI'
    }
  ];

  let failed = false;

  console.log('Running sanitizeUrl tests...');
  for (const tc of urlTestCases) {
    const actual = sanitizeUrl(tc.input);
    if (actual !== tc.expected) {
      console.error(`❌ FAIL: "${tc.description}"`);
      console.error(`  Input:    ${JSON.stringify(tc.input)}`);
      console.error(`  Expected: ${JSON.stringify(tc.expected)}`);
      console.error(`  Actual:   ${JSON.stringify(actual)}`);
      failed = true;
    } else {
      console.log(`✅ PASS: "${tc.description}"`);
    }
  }

  console.log('\nRunning sanitizeIconUrl tests...');
  for (const tc of iconUrlTestCases) {
    const actual = sanitizeIconUrl(tc.input);
    if (actual !== tc.expected) {
      console.error(`❌ FAIL: "${tc.description}"`);
      console.error(`  Input:    ${JSON.stringify(tc.input)}`);
      console.error(`  Expected: ${JSON.stringify(tc.expected)}`);
      console.error(`  Actual:   ${JSON.stringify(actual)}`);
      failed = true;
    } else {
      console.log(`✅ PASS: "${tc.description}"`);
    }
  }

  if (failed) {
    process.exit(1);
  } else {
    console.log('\n🎉 All tests passed successfully!');
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
