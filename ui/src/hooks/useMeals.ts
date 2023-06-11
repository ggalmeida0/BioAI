import { useMutation } from '@tanstack/react-query';
import useAuth from './useAuth';
import { SERVICE_SAVE_MEAL } from './queryKeys';
import { API } from 'aws-amplify';
import { Meal } from './useChat';

const useMeals = () => {
  const authContext = useAuth();
  const idToken =
    authContext.userAuthContext.data.signInUserSession.idToken.jwtToken;

  const mealContext = useMutation({
    mutationKey: [SERVICE_SAVE_MEAL],
    mutationFn: (meal: Meal) =>
      API.post('BioAPI', '/saveMeal', {
        headers: { Authorization: idToken },
        body: { meal },
      }),
  });

  return mealContext;
};

export default useMeals;
