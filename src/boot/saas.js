import axios from "axios";

var saas = {
  slideimg: "assets/images/hero/bitcoin-accounts.png",
  url: "https://api.lnbits.com",

  access_token: localStorage.getItem("token"),
  email: localStorage.getItem("email"),

  signup: async function (email, password, password2) {
    const { data } = await axios({
      method: "POST",
      url: this.url + "/signup",
      data: {
        email,
        password,
        password_repeat: password2,
      },
    });

    this.access_token = data.access_token;

    // ##### BAD PRACTICE, FOR TESTING ONLY #####
    localStorage.setItem("token", data.access_token);

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
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    this.access_token = data.access_token;

    // ##### BAD PRACTICE, FOR TESTING ONLY #####
    localStorage.setItem("token", data.access_token);

    localStorage.setItem("email", email);

    return data;
  },

  createInstance: async function () {
    return axios({
      method: "POST",
      url: this.url + "/instance",
      headers: {
        Authorization: "Bearer " + this.access_token,
      },
    });
  },

  updateInstance: function (id, action) {
    return axios({
      method: "PUT",
      url: this.url + "/instance",
      data: {
        action: action,
        instance_id: id,
      },
      headers: {
        Authorization: "Bearer " + this.access_token,
      },
    });
  },
  getInstances: async function () {
    const response = await axios({
      method: "GET",
      url: this.url + "/instance",
      headers: {
        Authorization: "Bearer " + this.access_token,
      },
    });

    return response;
  },
  logout: function () {
    this.access_token = null;
    this.email = null;
    localStorage.clear();
  },

  mapInstance: function (instance) {
    const progress = (start, stop) => {
      const now = new Date().getTime() / 1000;
      if (stop - start <= 0) {
        return 100;
      }

      const percentage = (1 - (stop - start) / (stop - now)) * 100;

      console.log("## percentage", percentage, start, now, stop);
      return percentage;
    };
    return {
      id: instance.id,
      instanceLink: `https://${instance.domain}/wallet`,
      backupLink: `https://${instance.domain}/admin/api/v1/backup`,
      enabled: instance.is_enabled ? "Yes" : "No",
      active: instance.is_active ? "Yes" : "No",
      name: instance.domain,
      cratedDate: new Date(instance.timestamp * 1000).toLocaleString(),
      stopDate: new Date(instance.timestamp_stop * 1000).toLocaleString(),
      timestamp: instance.timestamp,
      timestampStop: instance.timestamp_stop,
      lnurl: instance.lnurl,
      progress: progress(instance.timestamp, instance.timestamp_stop),
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
