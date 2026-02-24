import { VerifiedAccountPipe } from './verified-account.pipe';

describe('VerifiedAccountPipe', () => {
  it('create an instance', () => {
    const pipe = new VerifiedAccountPipe();
    expect(pipe).toBeTruthy();
  });
});
