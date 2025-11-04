import { QueryClient, dehydrate } from "@tanstack/react-query";
import { experimentsApi } from "./api";
import { queryKeys } from "./hooks";

export async function getServerSideExperiments(limit = 10, offset = 0) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
      },
    },
  });

  try {
    await queryClient.prefetchQuery({
      queryKey: [...queryKeys.experiments, limit, offset],
      queryFn: () => experimentsApi.list(limit, offset),
      staleTime: 60 * 1000,
    });

    return {
      dehydratedState: dehydrate(queryClient),
    };
  } catch (error) {
    return {
      dehydratedState: dehydrate(queryClient),
    };
  }
}

export async function getServerSideExperiment(id: string) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
      },
    },
  });

  try {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.experiment(id),
      queryFn: () => experimentsApi.get(id),
      staleTime: 60 * 1000,
    });

    return {
      dehydratedState: dehydrate(queryClient),
    };
  } catch (error) {
    return {
      dehydratedState: dehydrate(queryClient),
    };
  }
}
