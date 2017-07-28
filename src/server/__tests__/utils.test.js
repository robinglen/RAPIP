const utils = require('../utils');

describe('utils', () => {
  describe('convertNanToMilliSeconds', () => {
    it('converts nanoSeconds to milliSeconds', () => {
      const ms = utils.convertNanToMilliSeconds([100000, 100000000]);
      expect(ms).toEqual('100');
    });
  });
  describe('stringifyJson', () => {
    it('Returns ms for JSON.stringify', () => {
      const hrTime = utils.stringifyJson({ perf: 'matters' });
      expect(hrTime).toEqual('0');
    });
  });
  describe('parseJson', () => {
    it('Returns ms for response.json', async () => {
      const response = {
        json: () => {
          return new Promise((resolve, reject) => {
            resolve();
          });
        }
      };
      const hrTime = await utils.parseJson(response);
      expect(hrTime).toEqual('0');
    });
  });
});
