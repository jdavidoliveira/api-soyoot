import fastify from "fastify"
import { z } from "zod"
import { database } from "./lib/database"
import fastifyJwt from "@fastify/jwt"
import { env } from "../env"
import fastifyCors from "@fastify/cors"

const app = fastify()

app.register(fastifyJwt, {
  secret: env.SECRET,
})
app.register(fastifyCors, {
  origin: "*",
})

app.get("/", (request, reply) => {
  return reply.status(200).send({
    message: "API Funcionando!",
  })
})

//privates
app.post("/empresa", async (request, reply) => {
  const schemaBody = z.object({
    telefone: z.string(),
    email: z.string().email(),
    cnpj: z.string(),
    nome: z.string(),
  })

  const { cnpj, email, nome, telefone } = schemaBody.parse(request.body)

  const tokenJWT = request.headers.authorization

  if (!tokenJWT) {
    return reply.status(401).send({ message: "Não autorizado!" })
  }

  const empresa = await database.empresa.create({
    data: {
      cnpj,
      email,
      nome,
      telefone,
    },
  })

  if (!empresa) {
    return reply.status(201).send({ message: "Erro ao cadastrar a empresa" })
  }

  return reply
    .status(201)
    .send({ message: "Empresa cadastrada com sucesso!", empresa })
})

app.get("/empresa", async (request, reply) => {
  const tokenJWT = request.headers.authorization

  if (!tokenJWT) {
    return reply.status(401).send({ message: "Não autorizado!" })
  }

  const empresas = await database.empresa.findMany()

  return reply.send(empresas)
})

//public
app.post("/usuario", async (request, reply) => {
  const schemaBody = z.object({
    nome: z.string().min(4),
    sobrenome: z.string().min(4),
    email: z.string().email(),
    senha: z.string().min(6),
  })

  const { email, nome, senha, sobrenome } = schemaBody.parse(request.body)

  const usuario = await database.user.create({
    data: {
      email,
      nome,
      senha,
      sobrenome,
    },
  })

  return reply
    .status(201)
    .send({ message: "Usuário cadastrado com sucesso!", usuario: usuario })
})

app.post("/login", async (request, reply) => {
  const schemaBody = z.object({
    email: z.string().email(),
    senha: z.string().min(6),
  })

  const { email, senha } = schemaBody.parse(request.body)

  console.log(request.body)

  const usuario = await database.user.findUnique({
    where: {
      email,
    },
  })

  if (!usuario) {
    return reply.status(404).send({ message: "Usuário não encontrado!" })
  }

  if (senha !== usuario.senha) {
    return reply.status(401).send({ message: "Senha inválida!" })
  }

  const tokenJWT = app.jwt.sign({
    id: usuario.id,
  })

  return reply
    .status(200)
    .send({ message: "Login efetuado com sucesso!", token: tokenJWT })
})

app.listen({ port: 3333 }).then(() => {
  console.log("Server is running!")
})
