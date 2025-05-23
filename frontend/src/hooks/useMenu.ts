import { useQuery } from 'react-query';
import { menuService } from '@/services/menuService';
import { Category } from '@realtaste/shared';

export const useMenu = () => {
  return useQuery<Category[], Error>({
    queryKey: ['menu'],
    queryFn: menuService.getMenu,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
};

export const useMenuItem = (id: string) => {
  return useQuery({
    queryKey: ['menu-item', id],
    queryFn: () => menuService.getMenuItem(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};
