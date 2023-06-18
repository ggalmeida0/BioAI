import { UseMutationResult, UseQueryResult, useMutation, useQuery } from '@tanstack/react-query';
import useAuth from './useAuth';
import { SERVICE_GET_FREQUENT_MEALS, SERVICE_SAVE_MEAL } from './queryKeys';
import { API } from 'aws-amplify';
import { Meal } from './useChat';

type useMealsOptions = {
  enableGetFrequentMeals: boolean
}

type useMealsResult = {
  getFrequentMealsQuery: UseQueryResult<Meal[]>,
  saveMealMutation: UseMutationResult<any, unknown, Meal, unknown>
}

const useMeals = ({ enableGetFrequentMeals}: useMealsOptions): useMealsResult => {
  const authContext = useAuth();
  const idToken =
    authContext.userAuthContext.data.signInUserSession.idToken.jwtToken;

  const saveMealMutation = useMutation({
    mutationKey: [SERVICE_SAVE_MEAL],
    mutationFn: async (meal: Meal) =>
      await API.post('BioAPI', '/saveMeal', {
        headers: { Authorization: idToken },

        body: { meal },
      }),
  });

  const getFrequentMealsQuery = useQuery({
    queryKey: [SERVICE_GET_FREQUENT_MEALS],
    queryFn: async () => await API.get('BioAPI', '/getFrequentMeals', {
        headers: { Authorization: idToken },
    }),
    enabled: enableGetFrequentMeals
    })

  return { getFrequentMealsQuery, saveMealMutation };
};

export default useMeals;
