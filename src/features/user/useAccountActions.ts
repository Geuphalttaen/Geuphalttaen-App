import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/src/features/auth/hooks/useAuth';
import { useDeleteAccount } from './api';

export function useAccountActions() {
  const router = useRouter();
  const { signOut } = useAuth();
  const queryClient = useQueryClient();
  const { mutateAsync: deleteAccountMutate, isPending: isDeleting } = useDeleteAccount();

  const logout = useCallback(() => {
    void (async () => {
      try {
        await signOut();
      } catch {
        // signOut 실패해도 로그인 화면으로 이동
      }
      router.replace('/(auth)/login');
    })();
  }, [signOut, router]);

  const deleteAccount = useCallback(() => {
    Alert.alert(
      '회원 탈퇴',
      '탈퇴하면 작성한 리뷰, 청결도 평가와 계정 정보가 모두 삭제됩니다.\n복구할 수 없습니다. 정말 탈퇴하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '탈퇴',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              try {
                await deleteAccountMutate();
              } catch (e) {
                Alert.alert('오류', e instanceof Error ? e.message : '다시 시도해 주세요.');
                return;
              }
              // 서버 삭제 성공 후 — signOut 실패 시에도 반드시 캐시 초기화 및 화면 이동
              try {
                await signOut();
              } catch {
                // signOut 실패는 무시
              }
              queryClient.clear();
              router.replace('/(auth)/login');
            })();
          },
        },
      ],
    );
  }, [deleteAccountMutate, signOut, router, queryClient]);

  return { logout, deleteAccount, isDeleting };
}
