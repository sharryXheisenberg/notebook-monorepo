import { debounce } from "../debounce";

jest.useFakeTimers();

describe("debounce", () => {
  it("only calls the function once after rapid repeated calls", () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 500);

    debounced("a");
    debounced("b");
    debounced("c");

    expect(fn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(500);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("c"); // only the last call's args survive
  });
});
