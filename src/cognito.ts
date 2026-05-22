import { 
  CognitoUserPool, 
  CognitoUser, 
  AuthenticationDetails,
  CognitoUserAttribute
} from 'amazon-cognito-identity-js';

const poolData = {
  UserPoolId: 'sa-east-1_8p1x2GLK0',
  ClientId: '1fhs4ptlfjqscpfiso1643vitl'
};

export const userPool = new CognitoUserPool(poolData);

export const signUp = (email: string, password: string, name: string) => {
  return new Promise((resolve, reject) => {
    const attributeList = [
      new CognitoUserAttribute({ Name: 'name', Value: name }),
      new CognitoUserAttribute({ Name: 'email', Value: email }),
    ];

    userPool.signUp(email, password, attributeList, [], (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};

export const signIn = (email: string, password: string) => {
  return new Promise((resolve, reject) => {
    const authenticationDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    const userData = {
      Username: email,
      Pool: userPool,
    };

    const cognitoUser = new CognitoUser(userData);

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (result) => resolve(result),
      onFailure: (err) => reject(err),
      newPasswordRequired: (userAttributes) => {
        // Lógica caso a AWS exija troca de senha no primeiro acesso
        resolve({ newPasswordRequired: true, userAttributes });
      }
    });
  });
};

export const getSession = () => {
  return new Promise((resolve, reject) => {
    const cognitoUser = userPool.getCurrentUser();
    if (!cognitoUser) {
      resolve(null);
      return;
    }

    cognitoUser.getSession((err: any, session: any) => {
      if (err) reject(err);
      else resolve(session);
    });
  });
};

export const signOut = () => {
  const cognitoUser = userPool.getCurrentUser();
  if (cognitoUser) {
    cognitoUser.signOut();
  }
};

export const updateAttribute = (name: string, value: string) => {
  return new Promise((resolve, reject) => {
    const cognitoUser = userPool.getCurrentUser();
    if (!cognitoUser) return reject('Usuário não encontrado');

    cognitoUser.getSession((err: any, session: any) => {
      if (err) return reject(err);
      
      const attributeList = [
        new CognitoUserAttribute({ Name: name, Value: value }),
      ];

      cognitoUser.updateAttributes(attributeList, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  });
};
