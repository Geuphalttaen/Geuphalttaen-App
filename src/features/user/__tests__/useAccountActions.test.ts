import { act, renderHook } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useAccountActions } from '../useAccountActions';

const mockSignOut = jest.fn();
const mockReplace = jest.fn();
const mockClear = jest.fn();
const mockDeleteAccountMutate = jest.fn();

jest.mock('@/src/features/auth/hooks/useAuth', () => ({
  useAuth: () => ({ signOut: mockSignOut }),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ clear: mockClear }),
}));

jest.mock('../api', () => ({
  useDeleteAccount: () => ({
    mutateAsync: mockDeleteAccountMutate,
    isPending: false,
  }),
}));

const flushPromises = () => new Promise<void>(resolve => setImmediate(resolve));

describe('useAccountActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────
  // logout
  // ─────────────────────────────────────────

  it('logout — signOut 후 로그인 화면으로 이동한다', async () => {
    mockSignOut.mockResolvedValue(undefined);
    const { result } = renderHook(() => useAccountActions());

    act(() => { result.current.logout(); });
    await flushPromises();

    expect(mockSignOut).toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith('/(auth)/login');
  });

  it('logout — signOut 실패해도 로그인 화면으로 이동한다', async () => {
    mockSignOut.mockRejectedValue(new Error('signOut 실패'));
    const { result } = renderHook(() => useAccountActions());

    act(() => { result.current.logout(); });
    await flushPromises();

    expect(mockReplace).toHaveBeenCalledWith('/(auth)/login');
  });

  // ─────────────────────────────────────────
  // deleteAccount
  // ─────────────────────────────────────────

  it('deleteAccount — 탈퇴 확인 Alert을 표시한다', () => {
    jest.spyOn(Alert, 'alert');
    const { result } = renderHook(() => useAccountActions());

    act(() => { result.current.deleteAccount(); });

    expect(Alert.alert).toHaveBeenCalledWith(
      '회원 탈퇴',
      expect.stringContaining('복구할 수 없습니다'),
      expect.any(Array),
    );
  });

  it('deleteAccount — 확인 시 서버 삭제 → 캐시 초기화 → 로그인 화면 이동', async () => {
    mockDeleteAccountMutate.mockResolvedValue(undefined);
    mockSignOut.mockResolvedValue(undefined);

    let capturedOnPress: (() => void) | undefined;
    jest.spyOn(Alert, 'alert').mockImplementationOnce((_t, _m, buttons) => {
      capturedOnPress = (buttons as { text: string; onPress?: () => void }[])
        ?.find(b => b.text === '탈퇴')?.onPress;
    });

    const { result } = renderHook(() => useAccountActions());
    act(() => { result.current.deleteAccount(); });
    act(() => { capturedOnPress?.(); });
    await flushPromises();

    expect(mockDeleteAccountMutate).toHaveBeenCalled();
    expect(mockClear).toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith('/(auth)/login');
  });

  it('deleteAccount — 서버 삭제 실패 시 오류 Alert을 표시하고 이동하지 않는다', async () => {
    mockDeleteAccountMutate.mockRejectedValue(new Error('서버 오류'));
    jest.spyOn(Alert, 'alert')
      .mockImplementationOnce((_t, _m, buttons) => {
        (buttons as { text: string; onPress?: () => void }[])
          ?.find(b => b.text === '탈퇴')?.onPress?.();
      })
      .mockImplementationOnce(() => { /* 오류 Alert */ });

    const { result } = renderHook(() => useAccountActions());
    act(() => { result.current.deleteAccount(); });
    await flushPromises();

    expect(mockReplace).not.toHaveBeenCalled();
    expect(mockClear).not.toHaveBeenCalled();
  });

  it('deleteAccount — signOut 실패해도 캐시 초기화 + 로그인 이동은 실행한다', async () => {
    mockDeleteAccountMutate.mockResolvedValue(undefined);
    mockSignOut.mockRejectedValue(new Error('signOut 실패'));

    let capturedOnPress: (() => void) | undefined;
    jest.spyOn(Alert, 'alert').mockImplementationOnce((_t, _m, buttons) => {
      capturedOnPress = (buttons as { text: string; onPress?: () => void }[])
        ?.find(b => b.text === '탈퇴')?.onPress;
    });

    const { result } = renderHook(() => useAccountActions());
    act(() => { result.current.deleteAccount(); });
    act(() => { capturedOnPress?.(); });
    await flushPromises();

    expect(mockClear).toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith('/(auth)/login');
  });
});
