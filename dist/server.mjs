import {
  database
} from "./chunk-LKXGQX7K.mjs";

// src/server.ts
import fastify from "fastify";
import { z as z2 } from "zod";
import fastifyJwt from "@fastify/jwt";

// env.ts
import { z } from "zod";
var envSchema = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().default(3333),
  SECRET: z.string()
});
var env = envSchema.parse(process.env);

// src/server.ts
import fastifyCors from "@fastify/cors";
var app = fastify();
app.register(fastifyJwt, {
  secret: env.SECRET
});
app.register(fastifyCors, {
  origin: "*"
});
app.get("/", (request, reply) => {
  return reply.status(200).send({
    message: "API Funcionando!"
  });
});
app.post("/empresa", async (request, reply) => {
  const schemaBody = z2.object({
    telefone: z2.string(),
    email: z2.string().email(),
    cnpj: z2.string(),
    nome: z2.string()
  });
  const { cnpj, email, nome, telefone } = schemaBody.parse(request.body);
  const tokenJWT = request.headers.authorization;
  if (!tokenJWT) {
    return reply.status(401).send({ message: "N\xE3o autorizado!" });
  }
  const empresa = await database.empresa.create({
    data: {
      cnpj,
      email,
      nome,
      telefone
    }
  });
  if (!empresa) {
    return reply.status(201).send({ message: "Erro ao cadastrar a empresa" });
  }
  return reply.status(201).send({ message: "Empresa cadastrada com sucesso!", empresa });
});
app.get("/empresa", async (request, reply) => {
  const tokenJWT = request.headers.authorization;
  if (!tokenJWT) {
    return reply.status(401).send({ message: "N\xE3o autorizado!" });
  }
  const empresas = await database.empresa.findMany();
  return reply.send(empresas);
});
app.post("/usuario", async (request, reply) => {
  const schemaBody = z2.object({
    nome: z2.string().min(4),
    sobrenome: z2.string().min(4),
    email: z2.string().email(),
    senha: z2.string().min(6)
  });
  const { email, nome, senha, sobrenome } = schemaBody.parse(request.body);
  const usuario = await database.user.create({
    data: {
      email,
      nome,
      senha,
      sobrenome
    }
  });
  return reply.status(201).send({ message: "Usu\xE1rio cadastrado com sucesso!", usuario });
});
app.post("/login", async (request, reply) => {
  const schemaBody = z2.object({
    email: z2.string().email(),
    senha: z2.string().min(6)
  });
  const { email, senha } = schemaBody.parse(request.body);
  console.log(request.body);
  const usuario = await database.user.findUnique({
    where: {
      email
    }
  });
  if (!usuario) {
    return reply.status(404).send({ message: "Usu\xE1rio n\xE3o encontrado!" });
  }
  if (senha !== usuario.senha) {
    return reply.status(401).send({ message: "Senha inv\xE1lida!" });
  }
  const tokenJWT = app.jwt.sign({
    id: usuario.id
  });
  return reply.status(200).send({ message: "Login efetuado com sucesso!", token: tokenJWT });
});
app.listen({ port: 3333 }).then(() => {
  console.log("Server is running!");
});
