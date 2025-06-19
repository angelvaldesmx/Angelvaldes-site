exports.handler = async () => {
  const clave = Math.random().toString(36).substring(2, 10).toUpperCase();
  return {
    statusCode: 200,
    body: JSON.stringify({ clave }),
  };
};