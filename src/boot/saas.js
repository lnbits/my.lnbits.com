import axios from "axios";

console.log("### saas", saas);
var saas = {
  slideimg: "assets/images/hero/bitcoin-accounts.png",
  url: "https://api.lnbits.com",
  // url: "https://saas.b1tco1n.org",
  prompt: false,
  instanceDialog: false,
  loginDialogue: false,
  signUpDialogue: false,
  signupErrors: [],
  access_token: localStorage.getItem("token"),
  email: localStorage.getItem("email"),
  logged: false,
  login_details: {
    email: "",
    password: "",
  },
  signup_details: {
    email: "",
    password: "",
    password_repeat: "",
  },
  subdomain: "",
  password: "",
  active_instance: {},
  active_instance_id: null,
  interval: null,
  instances: {},

  date: function (date) {
    return moment.unix(date).format("YYYY-MM-DD, hh:mm");
  },
  showPrompt: function () {
    if (this.logged) {
      this.createInstance();
    } else {
      this.loginDialogue = true;
    }
  },
  signup: function () {
    let that = this;
    axios({
      method: "POST",
      url: this.url + "/signup",
      data: this.signup_details,
    })
      .then(function (response) {
        that.$q.notify({
          type: "positive",
          message: "signup successful!",
        });
        that.signUpDialogue = false;
        that.loginDialogue = true;
      })
      .catch(function (error) {
        if (error.response) {
          that.signupErrors = error.response.data.detail;
          that.$q.notify({
            type: "negative",
            message: "signup failed.",
          });
        }
      });
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

    this.logged = true;
    return data;
  },
  showInstance: function (id) {
    this.active_instance_id = id;
    this.setActiveInstance(id);
  },
  setActiveInstance: function (new_id) {
    let id = new_id || this.active_instance_id;
    if (id) {
      this.active_instance = this.instances
        .filter((instance) => {
          return instance.id === id;
        })
        .pop();
    }
    if (new_id) {
      this.instanceDialog = true;
    }
  },
  qrUrl: function () {
    return (
      "https://legend.lnbits.com/api/v1/qrcode/" + this.active_instance.lnurl
    );
  },
  openAdminUrl: function () {
    let url =
      "https://" +
      this.active_instance.domain +
      "/wallet?usr=" +
      this.active_instance.adminuser;
    window.open(url, "_blank");
  },
  downloadBackup: function () {
    let url =
      "https://" +
      this.active_instance.domain +
      "/admin/api/v1/backup/?usr=" +
      this.active_instance.adminuser;
    window.open(url, "_blank");
  },
  createInstance: async function () {
    return axios({
      method: "POST",
      url: this.url + "/instance",
      headers: {
        Authorization: "Bearer " + this.access_token,
      },
    });
    // .then(function (response) {
    //   that.$q.notify({
    //     type: "positive",
    //     message: "created instance!",
    //   });
    //   that.getInstances(function () {
    //     that.showInstance(response.data.id);
    //   });
    // })
    // .catch(function (error) {
    //   if (error.response) {
    //     msg = error.response.data.detail;
    //     that.$q.notify({
    //       type: "negative",
    //       message: msg,
    //     });
    //   }
    // });
  },
  confirmDialog(message) {
    return Quasar.Dialog.create({
      message: message,
      ok: {
        flat: true,
        color: "deep-purple",
      },
      cancel: {
        flat: true,
        color: "grey",
      },
    });
  },
  updateInstance: function (action) {
    let that = this;
    let update = () => {
      axios({
        method: "PUT",
        url: this.url + "/instance",
        data: {
          action: action,
          instance_id: this.active_instance.id,
        },
        headers: {
          Authorization: "Bearer " + this.access_token,
        },
      })
        .then(function (response) {
          that.getInstances();
          that.$q.notify({
            type: "positive",
            message: "ran action: " + action,
          });
          if (action == "destroy") {
            that.instanceDialog = false;
          }
        })
        .catch(function (error) {
          let msg = "run action FAILED: " + action;
          if (error.response && error.response.data) {
            msg += ", " + error.response.data;
          }
          that.$q.notify({
            type: "negative",
            message: msg,
          });
        });
    };
    let message = undefined;
    if (action == "destroy") {
      message =
        "are you sure you want to destroy? destroying will delete your instance and every bit of data.";
    }
    if (action == "reset") {
      message =
        "are you sure you want to reset? resetting will delete all your admin settings including your super user.";
    }
    if (action == "disable") {
      message =
        "are you sure you want to disable? disabling will make your instance unavailable.";
    }
    if (action == "restart") {
      message =
        "are you sure you want to restart? restarting will make your instance temporarly unavailable.";
    }
    if (message) {
      this.confirmDialog(message).onOk(update);
    } else {
      update();
    }
  },
  getInstances: async function (cb) {
    // if (!this.logged) {
    //   throw Error("User not logged in!");
    // }

    const response = await axios({
      method: "GET",
      url: this.url + "/instance",
      headers: {
        Authorization: "Bearer " + this.access_token,
      },
    });

    this.instances = response.data;
    // this.setActiveInstance();
    if (cb) {
      cb();
    }

    return response;

    // if (error.response) {
    //   msg = error.response.data.detail;
    //   that.$q.notify({
    //     type: "negative",
    //     message: msg,
    //   });
    // }
    // if (error.response.status == 401) {
    //   let msg = "api_key timout...";
    //   that.logged = false;
    //   clearInterval(that.interval);
    //   that.$q.notify({
    //     type: "negative",
    //     message: msg,
    //   });
    // }
  },
  copyInvoice: function () {
    Quasar.copyToClipboard(this.active_instance.lnurl);
    this.$q.notify({
      message: "Copied to clipboard",
    });
  },
  logout: function () {
    console.log("### logout");
    this.logged = false;
    this.access_token = null;
    localStorage.setItem("token", null);
    localStorage.setItem("email", null);
  },

  mapInstance: function (instance, index) {
    return {
      id: instance.id,
      instanceLink: `https://${instance.domain}/wallet`,
      backupLink: `https://${instance.domain}/admin/api/v1/backup`,
      enabled: instance.is_enabled ? "Yes" : "No",
      active: instance.is_active ? "Yes" : "No",
      name: instance.domain,
      cratedDate: new Date(instance.timestamp * 1000).toLocaleString(),
      stopDate: new Date(instance.timestamp_stop * 1000).toLocaleString(),
      lnurl: instance.lnurl,
      progress: 100 / (index + 1),
    };
  },
};

export { saas };
