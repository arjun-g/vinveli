import create from "zustand";
import produce from "immer";

const useStore = create((set, get) => {
    return {
        currentUser: null,

        missions: [],
        identities: [],
        tickets: [],
        geo: {
            countries: [],
            states: [],
            cities: [],

            current:{
                country: null,
                state: null
            }
        },

        getCountries: async () => {
            const countries = await fetch("/api/geo", {
                method: "POST",
                body: JSON.stringify({})
            }).then(resp => resp.json());
            set(produce(state => {
                state.geo.countries = countries.map(country => ({ label: country.name, value: country.Iso2 }));;
                state.geo.current.country = null;
                state.geo.current.state = null;
            }))
            return countries;
        },
        getStates: async (country) => {
            const states = await fetch("/api/geo", {
                method: "POST",
                body: JSON.stringify({
                    country
                }),
                headers: {
                    "Content-Type": "application/json"
                }
            }).then(resp => resp.json());
            set(produce(state => {
                state.geo.current.country = state.geo.countries.find(ctry => ctry.label === country);
                state.geo.current.state = null;
                state.geo.states = states.map(state => ({ label: state.name, value: state.state_code }));
            }))
            return states;
        },
        getCities: async (country, state) => {
            const cities = await fetch("/api/geo", {
                method: "POST",
                body: JSON.stringify({
                    country,
                    state
                }),
                headers: {
                    "Content-Type": "application/json"
                }
            }).then(resp => resp.json());
            set(produce(s => {
                // s.geo.current.country = s.geo.countries.find(ctry => country.label === country);
                s.geo.current.state = s.geo.states.find(st => st.label === state);
                s.geo.cities = cities.map(city => ({ label: city, value: city }));
            }))
            return cities;
        },

        getOfficialIdentities: async () => {
            const identitiesresult = await fetch("/api/identity").then(resp => resp.json());
            const identities = identitiesresult.map(identity => {
                return {
                    country: identity.country,
                    label: identity.name,
                    value: identity.type
                };
            });
            set(produce(state => {
                state.identities = identities;
            }));
            return identities;
        },

        createWallet: async (metadata) => {
            await fetch("/api/wallet", {
                method: "POST",
                body: JSON.stringify({ metadata }),
                headers: {
                    "Content-Type": "application/json"
                }
            }).then(resp => resp.json());
            const wallet = await fetch("/api/wallet").then(resp => resp.json());
            set(produce(state => {
                state.wallet = wallet;
                get().getUser();
            }))
            return wallet;
        },

        addVirtualAccount: async (country, currency) => {
            await fetch("/api/wallet/va", {
                method: "POST",
                body: JSON.stringify({
                    country,
                    currency
                }),
                headers: {
                    "Content-Type": "application/json"
                }
            }).then(resp => resp.json());
            get().getWallet();
        },

        depositAmount: async ({ account, currency, amount }) => {
            await fetch(`/api/wallet/va/${account}/deposit`, {
                method: "PUT",
                body: JSON.stringify({
                    currency,
                    amount
                }),
                headers: {
                    "Content-Type": "application/json"
                }
            }).then(resp => resp.json());
            get().getWallet();
        },

        getWallet: async () => {
            const wallet = await fetch("/api/wallet").then(resp => resp.json());
            set(produce(state => {
                state.wallet = wallet;
            }))
            return wallet;
        },

        getWalletCountries: async () => {
            const countries = await fetch("/api/wallet/va/countries").then(resp => resp.json());
            return countries;
        },

        getWalletCurrencies: async (country) => {
            const currencies = await fetch(`/api/wallet/va/currencies/${country}`).then(resp => resp.json());
            return currencies.map(currency => ({ label: currency, value: currency }));
        },

        getMissions: async () => {
            const missions = await fetch("/api/missions").then(resp => resp.json()).then(json => json.missions);
            set(produce(state => {
                state.missions = missions;
            }))
            return missions;
        },

        getUser: async () => {
            const user = await fetch("/api/user").then(resp => resp.json());
            set(produce(state => {
                state.currentUser = user;
            }));
            return user;
        },

        updateUser: async (details) => {
            const user = await fetch("/api/user", {
                method: "PUT",
                body: JSON.stringify(details),
                headers: {
                    "Content-Type": "application/json"
                }
            }).then(resp => resp.json());
            set(produce(state => {
                state.currentUser = user;
            }));
            return user;
        },

        buyTicket: async ({
            missionId, count, deposit, seats
        }) => {
            const ticket = await fetch("/api/ticket", {
                method: "POST",
                body: JSON.stringify({
                    missionId,
                    count,
                    deposit,
                    seats
                }),
                headers: {
                    "Content-Type": "application/json"
                }
            }).then(resp => resp.json());
            return ticket;
        },

        updateTicket: async ticketId => {
            const ticket = await fetch(`/api/ticket/${ticketId}`, {
                method: "PUT",
                body: JSON.stringify({}),
                headers: {
                    "Content-Type": "application/json"
                }
            }).then(resp => resp.json());
            return ticket;
        },

        getTickets: async () => {
            const { tickets } = await fetch(
                `/api/ticket`
            ).then(resp => resp.json());
            set(produce(state => {
                state.tickets = tickets.reverse();
            }));
            return tickets;
        },

        cancelTicket: async (ticketId) => {
            await fetch(
                `/api/ticket/${ticketId}`,
                {
                    method: "DELETE"
                }
            ).then(resp => resp.json());
            get().getTickets();
        },

        getBeneficiaryUrl: async (redirectTo) => {
            const { uri } = await fetch(
                `/api//wallet/beneficiary?complete_url=${encodeURIComponent(redirectTo)}&cancel_url=${encodeURIComponent(redirectTo)}`
            ).then(resp => resp.json());
            return uri;
        },

        signup: async ({
            email,
            password
        }) => {
            const user = await fetch("/api/user/register", {
                body: JSON.stringify({
                    email: email,
                    password: password
                }),
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                }
            })
            .then(resp => resp.json());
            if(user.error){
                return Promise.reject({ error: user.error });
            }
            set(produce(state => {
                state.currentUser = user;
            }));
            return user;
        },

        login: async ({
            email,
            password
        }) => {
            const user = await fetch("/api/user/login", {
                body: JSON.stringify({
                    email: email,
                    password: password
                }),
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                }
            })
            .then(resp => resp.json());
            if(user.error){
                return Promise.reject({ error: user.error });
            }
            set(produce(state => {
                state.currentUser = user;
            }));
            return user;
        }
    }
});

export { useStore };