process.env.NEXT_PUBLIC_API_URL = "http://localhost:5000";
import "@testing-library/jest-dom";

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserverMock as any;
