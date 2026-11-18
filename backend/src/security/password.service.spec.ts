import { PasswordService } from './password.service.js';

describe('PasswordService', () => {
  let passwordService: PasswordService;

  beforeEach(() => {
    passwordService = new PasswordService();
  });

  describe('hash', () => {
    it('should return an Argon2id hash', async () => {
      const password = 'StrongPassword123!';
      const hash = await passwordService.hash(password);

      expect(hash).toBeDefined();
      expect(hash).toContain('$argon2id$');
    });

    it('should generate different hashes for the same password', async () => {
      const password = 'StrongPassword123!';

      const firstHash = await passwordService.hash(password);
      const secondHash = await passwordService.hash(password);

      expect(firstHash).not.toBe(secondHash);
    });
  });

  describe('verify', () => {
    it('should return true for the correct password', async () => {
      const password = 'StrongPassword123!';
      const hash = await passwordService.hash(password);

      const result = await passwordService.verify(hash, password);

      expect(result).toBe(true);
    });

    it('should return false for an incorrect password', async () => {
      const password = 'StrongPassword123!';
      const hash = await passwordService.hash(password);

      const result = await passwordService.verify(hash, 'WrongPassword123!');

      expect(result).toBe(false);
    });
  });
});
