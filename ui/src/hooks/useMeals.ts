import { useMutation, useQuery } from '@tanstack/react-query';
import useAuth from './useAuth';
import { SERVICE_GET_FREQUENT_MEALS, SERVICE_SAVE_MEAL } from './queryKeys';
import { API } from 'aws-amplify';
import { Meal } from './useChat';

const useMeals = () => {
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
    queryFn: async () => {
      const res = await API.get('BioAPI', '/getFrequentMeals', {
        headers: { Authorization: idToken },
      });
      console.log(res)
      return res
    },
  });

  return { getFrequentMealsQuery, saveMealMutation };
};

export default useMeals;
