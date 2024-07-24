import axios from "axios";
import { secondsToDhm } from "src/boot/utils";

var saas = {
  slideimg: "assets/images/hero/bitcoin-accounts.png",
  url: "https://api.lnbits.com",
  serverTime: null,

  username: localStorage.getItem("username"),

  signup: async function (username, password, password2) {
    const { data } = await axios({
      method: "POST",
      url: this.url + "/signup",
      withCredentials: true,
      data: {
        username,
        password,
        password_repeat: password2,
      },
    });

    localStorage.setItem("username", username);

    return data;
  },
  login: async function (username, password) {
    const formData = new FormData();
    formData.append("username", username);
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
    localStorage.setItem("username", username);

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
  getUserInstancesLogs: async function () {
    const response = await axios({
      method: "GET",
      url: this.url + "/instance/logs",
      withCredentials: true,
    });

    return response;
  },
  getInstancesLogs: async function (id) {
    const response = await axios({
      method: "GET",
      url: this.url + `/instance/${id}/logs`,
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
    this.username = null;
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

      return Math.floor(percentage);
    };

    const status = (active, enabled) => {
      if (!active){
        return "Not Paid"
      }
      if (!enabled) {
        return "Disabled"
      }
      return "Runnning"
    }

    const timeLeft = Math.floor(
      Math.max(instance.timestamp_stop - this.serverTime, 0)
    );
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
      timestampStart: instance.timestamp_start,
      timestampStop: instance.timestamp_stop,
      lnurl: instance.lnurl,
      timeLeft: timeLeft,
      timeLeftFormatted: secondsToDhm(timeLeft),
      statusText: status(instance.is_active, instance.is_enabled),
      progress: progress(
        instance.timestamp_start || instance.timestamp,
        instance.timestamp_stop,
        this.serverTime
      ),
    };
  },
  mapErrorToString(error) {
    const data = error.response?.data;
    if (!data) {
      return;
    }
    if (typeof data === "string") {
      return data;
    }
    return data?.detail?.map((d) => d.msg).join(", ");
  },
};

(async () => {
  axios.interceptors.response.use(
    (response) => response,
    (err) => {
      if (err?.response?.status === 401) {
        saas.logout();
        if (window.location.pathname !==  "/login") {
          setTimeout(() => (window.location.href = "/login"), 500);
        }
      }
      return Promise.reject(err);
    }
  );
})();

export { saas };
