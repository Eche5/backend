exports.user = (req, res, next) => {
  const users = ["logistics_user", "processing_user", "customer_rep"];
  if (users.findIndex((i) => i === req.user.role) < 0) {
    return res.status(403).json({
      success: false,
      body: {
        status: 403,
        title: "Unauthorized Request",
        data: {
          location: "database",
          path: "user",
          field: "role",
          msg: "User is not authorized",
        },
      },
    });
  }
  next();
};

exports.sub_admin_logistics = (req, res, next) => {
  const allowedRoles = ["sub_admin", "sub_logistics_admin"];
  if (allowedRoles.findIndex((i) => i === req.user.role) < 0) {
    return res.status(403).json({
      success: false,
      body: {
        status: 403,
        title: "Unauthorized Request",
        data: {
          location: "database",
          path: "user",
          field: "role",
          msg: "User is not authorized",
        },
      },
    });
  }
  next();
};

exports.super_admin = (req, res, next) => {
  if (req.user.role !== "super_admin") {
    return res.status(403).json({
      success: false,
      body: {
        status: 403,
        title: "Unauthorized Request",
        data: {
          location: "database",
          path: "user",
          field: "role",
          msg: "User is not authorized",
        },
      },
    });
  }
  next();
};

exports.logistics_user = (req, res, next) => {
  if (req.user.role !== "logistics_user") {
    return res.status(403).json({
      success: false,
      body: {
        status: 403,
        title: "Unauthorized Request",
        data: {
          location: "database",
          path: "user",
          field: "role",
          msg: "User is not authorized",
        },
      },
    });
  }
  next();
};

exports.processing_user = (req, res, next) => {
  if (req.user.role !== "processing_user") {
    return res.status(403).json({
      success: false,
      body: {
        status: 403,
        title: "Unauthorized Request",
        data: {
          location: "database",
          path: "user",
          field: "role",
          msg: "User is not authorized",
        },
      },
    });
  }
  next();
};

exports.customer_rep = (req, res, next) => {
  if (req.user.role !== "customer_rep") {
    return res.status(403).json({
      success: false,
      body: {
        status: 403,
        title: "Unauthorized Request",
        data: {
          location: "database",
          path: "user",
          field: "role",
          msg: "User is not authorized",
        },
      },
    });
  }
  next();
};
