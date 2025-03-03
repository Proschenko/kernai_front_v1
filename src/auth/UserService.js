import Keycloak from "keycloak-js";

const _kc = new Keycloak({
    
    realm: process.env.REACT_APP_REALM,
    url: process.env.REACT_APP_KC,
    clientId: process.env.REACT_APP_CLIENT
});

const initKeycloak = (onAuthenticatedCallback) => {
    _kc.init({
        onLoad: 'check-sso',
        pkceMethod: 'S256',
    })
        .then((authenticated) => {
            if (!authenticated) {
                console.log("user is not authenticated..!");
            }
            onAuthenticatedCallback();
        })
        .catch(console.error);
    
    
};

const doLogin = _kc.login;

const doLogout = _kc.logout;

const getToken = () => _kc.token;

const isLoggedIn = () => !!_kc.token;

const updateToken = (successCallback) =>
    _kc.updateToken(5)
        .then(successCallback)
        .catch(doLogin);

const getUsername = () => _kc.tokenParsed?.preferred_username;
const getMail = () => _kc.tokenParsed?.email;

const hasRole = (role) => _kc.hasResourceRole(role, process.env.EAV_CLIENT);

const UserService = {
    initKeycloak,
    doLogin,
    doLogout,
    isLoggedIn,
    getToken,
    updateToken,
    getUsername,
    getMail,
    hasRole,
};

export default UserService;