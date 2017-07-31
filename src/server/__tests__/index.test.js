// need to add some mock tests for fetch

const { _formatPerformanceMetrics } = require("../index");

describe("server", () => {
  describe("_formatPerformanceMetrics", () => {
    it("returns valid performance metrics object", () => {
      const metrics = _formatPerformanceMetrics(
        "http://my.example.api",
        {
          timings: 500,
          size: 0.8,
          gzipEnabled: true
        },
        6,
        2
      );
      expect(metrics).toEqual({
        response: {
          api: "http://my.example.api",
          gzipEnabled: true,
          parse: {
            message: "6ms",
            raw: 6
          },
          request: { message: "500ms", raw: 500 },
          size: { message: "0.8kb", raw: 0.8 },
          stringify: { message: "2ms", raw: 2 }
        }
      });
    });
  });
});
