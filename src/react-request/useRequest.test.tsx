import React, { ReactNode } from 'react';
import { renderHook, act } from '@testing-library/react';
import { useRequest, RequestError } from './useRequest';
import { RequestProvider } from './RequestProvider';

// Helper to wrap hooks with RequestProvider
const wrapper = ({ children }: { children: ReactNode }) => (
  <RequestProvider>{children}</RequestProvider>
);

describe('useRequest', () => {
  // Mock service function
  const mockService = jest.fn();

  beforeEach(() => {
    // Reset mock before each test
    mockService.mockReset();
  });

  describe('refresh functionality', () => {
    test('1.1: refresh re-executes the last request with the same parameters', async () => {
      mockService.mockResolvedValue({ data: 'initial data' });
      const { result } = renderHook(() => useRequest(mockService), { wrapper });

      const initialParams = { id: 1 };
      await act(async () => {
        result.current.run(initialParams);
      });

      expect(mockService).toHaveBeenCalledTimes(1);
      expect(mockService).toHaveBeenCalledWith(initialParams);
      expect(result.current.data).toEqual({ data: 'initial data' });

      // Mock for refresh call
      mockService.mockResolvedValueOnce({ data: 'refreshed data' });
      await act(async () => {
        result.current.refresh();
        // Wait for the refresh to complete
      });

      expect(mockService).toHaveBeenCalledTimes(2);
      expect(mockService).toHaveBeenCalledWith(initialParams); // Called again with the same params
      expect(result.current.data).toEqual({ data: 'refreshed data' });
    });

    test('1.2: refresh does nothing or returns/resolves void if called before any run', async () => {
      const { result } = renderHook(() => useRequest(mockService), {
        wrapper,
      });

      await act(async () => {
        // Directly call refresh without run
        const refreshResult = await result.current.refresh();
        expect(refreshResult).toBeUndefined(); // Or whatever it resolves to when no params
      });

      expect(mockService).not.toHaveBeenCalled();
    });
  });

  describe('setData functionality', () => {
    test('2.1: setData correctly sets data for the run function', async () => {
      mockService.mockResolvedValue({ data: 'service data' });
      const { result } = renderHook(() => useRequest(mockService), { wrapper });

      const dataForSetRequest = { source: 'setData' };
      const dataForRun = { source: 'runParam' };

      act(() => {
        result.current.setData(dataForSetRequest);
      });

      await act(async () => {
        result.current.run(dataForRun); // These params should be ignored
      });

      expect(mockService).toHaveBeenCalledTimes(1);
      // Service should be called with data from setData
      expect(mockService).toHaveBeenCalledWith(dataForSetRequest);
      expect(result.current.data).toEqual({ data: 'service data' });
    });

    test('2.2: Data set by setData is cleared after run executes', async () => {
      mockService.mockResolvedValueOnce({ data: 'first call data' });
      const { result } = renderHook(() => useRequest(mockService), { wrapper });

      const dataA = { source: 'dataA' };
      const dataB = { source: 'dataB' };

      // First call: using setData
      act(() => {
        result.current.setData(dataA);
      });

      await act(async () => {
        result.current.run(); // No params, should use dataA
      });

      expect(mockService).toHaveBeenCalledTimes(1);
      expect(mockService).toHaveBeenCalledWith(dataA);
      expect(result.current.data).toEqual({ data: 'first call data' });

      // Second call: using direct params
      mockService.mockResolvedValueOnce({ data: 'second call data' });
      await act(async () => {
        result.current.run(dataB); // Should use dataB as setData payload is cleared
      });

      expect(mockService).toHaveBeenCalledTimes(2);
      expect(mockService).toHaveBeenCalledWith(dataB);
      expect(result.current.data).toEqual({ data: 'second call data' });
    });

    test('2.3: refresh uses original params from run (which were set by setData), not subsequent setData params', async () => {
      mockService.mockResolvedValueOnce({ data: 'run data' }); // For the initial run
      const { result } = renderHook(() => useRequest(mockService), { wrapper });

      const dataA_forSetRequest = { source: 'dataA_setRequest' }; // This will be used by run() and become lastRequestParams
      const dataB_forRun = { source: 'dataB_run' }; // This will be ignored because dataA is set via setData

      // Set data via setData, then run
      act(() => {
        result.current.setData(dataA_forSetRequest);
      });

      await act(async () => {
        result.current.run(dataB_forRun); // run will use dataA_forSetRequest
      });

      expect(mockService).toHaveBeenCalledTimes(1);
      expect(mockService).toHaveBeenCalledWith(dataA_forSetRequest);
      expect(result.current.data).toEqual({ data: 'run data' });
      expect(result.current.params).toEqual(dataA_forSetRequest); // lastRequestParams should be dataA

      // Now, try to set new data with setData, but don't run
      const dataC_forSetRequest_ignored = { source: 'dataC_ignored' };
      act(() => {
        result.current.setData(dataC_forSetRequest_ignored);
      });

      // Mock for refresh call
      mockService.mockResolvedValueOnce({ data: 'refresh data' });

      // Call refresh
      await act(async () => {
        result.current.refresh();
      });

      // Refresh should use dataA_forSetRequest (the last *executed* params)
      expect(mockService).toHaveBeenCalledTimes(2);
      expect(mockService).toHaveBeenCalledWith(dataA_forSetRequest);
      expect(result.current.data).toEqual({ data: 'refresh data' });
      // Ensure the requestPayload (dataC) was not used by refresh and should be cleared or ignored
      // The current implementation of run clears requestPayload, so a subsequent direct run would not use dataC.
      // And refresh uses lastRequestParams, not requestPayload.
    });
  });

  // Basic error handling test (good to have)
  test('handles service error', async () => {
    const error = new RequestError('Network Error', 500);
    mockService.mockRejectedValueOnce(error);
    const { result } = renderHook(() => useRequest(mockService), { wrapper });

    await act(async () => {
      result.current.run({ id: 1 });
      // Wait for error handling
    });

    expect(result.current.error).toEqual(error);
    expect(result.current.data).toBeUndefined();
  });
});
