import axios from "axios";

var saas = {
  slideimg: "assets/images/hero/bitcoin-accounts.png",
  url: "https://api.lnbits.com",
  serverTime: null,

  email: localStorage.getItem("email"),

  signup: async function (email, password, password2) {
    const { data } = await axios({
      method: "POST",
      url: this.url + "/signup",
      withCredentials: true,
      data: {
        email,
        password,
        password_repeat: password2,
      },
    });

    localStorage.setItem("email", email);

    return data;
  },
  login: async function (email, password) {
    const formData = new FormData();
    formData.append("username", email);
    formData.append("password", password);
    const { data } = await axios({
      method: "POST",
      url: this.url + "/login",
      data: formData,
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    localStorage.setItem("email", email);

    return data;
  },

  createInstance: async function () {
    return axios({
      method: "POST",
      url: this.url + "/instance",
      withCredentials: true,
    });
  },

  updateInstance: function (id, action) {
    return axios({
      method: "PUT",
      url: this.url + "/instance",
      withCredentials: true,
      data: {
        action: action,
        instance_id: id,
      },
    });
  },
  getInstances: async function () {
    const response = await axios({
      method: "GET",
      url: this.url + "/instance",
      withCredentials: true,
    });

    return response;
  },
  status: async function () {
    const response = await axios({
      method: "GET",
      url: this.url,
      withCredentials: true,
    });

    this.serverTime = response.data.timestamp;

    return response;
  },
  logout: async function () {
    const response = await axios({
      method: "POST",
      url: this.url + "/logout",
      withCredentials: true,
    });
    console.log('### response', response)
    this.email = null;
    localStorage.clear();
    return response;
  },

  mapInstance: function (instance) {
    const progress = (start, stop, serverTime) => {
      if (!serverTime) {
        return 0;
      }
      if (stop - start <= 0 || stop - serverTime <= 0) {
        return 100;
      }

      const percentage = (1 - (stop - serverTime) / (stop - start)) * 100;

      return Math.round(percentage);
    };
    return {
      id: instance.id,
      instanceLink: `https://${instance.domain}/wallet`,
      backupLink: `https://${instance.domain}/admin/api/v1/backup`,
      enabled: instance.is_enabled,
      active: instance.is_active,
      expired: instance.timestamp_stop < this.serverTime,
      name: instance.domain,
      createdDate: new Date(instance.timestamp * 1000).toLocaleString(),
      stopDate: new Date(instance.timestamp_stop * 1000).toLocaleString(),
      timestamp: instance.timestamp,
      timestampStop: instance.timestamp_stop,
      lnurl: instance.lnurl,

      progress: progress(
        instance.timestamp,
        instance.timestamp_stop,
        this.serverTime
      ),
    };
  },
};

(async () => {
  axios.interceptors.response.use(
    (response) => response,
    (err) => {
      if (err?.response?.status === 401) {
        saas.logout();
        window.location.href = "/login";
      }
      return Promise.reject(err);
    }
  );
})();

export { saas };
