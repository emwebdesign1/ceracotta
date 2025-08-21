// état minimal partagé (token + panier en cache côté front)
export const state = {
  accessToken: null,
  cart: { items: [] }
};

export const authHeaders = () =>
  state.accessToken ? { Authorization: `Bearer ${state.accessToken}` } : {};
