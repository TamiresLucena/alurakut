import MainGrid from '../src/components/MainGrid'
import Box from '../src/components/Box'
import { AlurakutMenu, AlurakutProfileSidebarMenuDefault, OrkutNostalgicIconSet } from '../src/lib/AlurakutCommons';
import { ProfileRelationsBoxWrapper } from '../src/components/ProfileRelations';
import React, { useState, useEffect } from 'react';
import nookies from 'nookies';
import jwt from 'jsonwebtoken';

function ProfileSidebar(propriedades) {
  console.log(propriedades);
  return (
    <Box as="aside">
      <img src={`https://github.com/${propriedades.githubUser}.png`} style={{ borderRadius: '8px' }} />
      <hr />
      <p>
        <a className="boxLink" href={`https://github.com/${propriedades.githubUser}`}>
          @{propriedades.githubUser}
        </a>
      </p>
      <hr />
      <AlurakutProfileSidebarMenuDefault />
    </Box>
  )
}

export default function Home({ githubUser }) {

  const [pessoasFavoritas, setPessoasFavoritas] = useState([])
  const [comunidades, setComunidades] = useState([])

  useEffect(() => {
    fetch(`https://api.github.com/users/${githubUser}/followers`)
      .then((seguidores) => {
        seguidores.json().then((seguidoresTratados) => {
          const loginsSeguimores = seguidoresTratados.map((seguidor) => {
            return seguidor.login
          })
          if (loginsSeguimores.length > 6) loginsSeguimores.length = 6
          setPessoasFavoritas(loginsSeguimores)
        }).catch((err) => {
          throw err
        })
      }).catch((err) => {
        console.log('ERRO ------', err)
      })
  }, []);


  // API GraphQL
  //   fetch('https://graphql.datocms.com/', {
  //     method: 'POST',
  //     headers: {
  //       'Authorization': '7f7590695431ea76f84616a4b4d32d',
  //       'Content-Type': 'application/json',
  //       'Accept': 'application/json',
  //     },
  //     body: JSON.stringify({
  //       "query": `query {
  //       allCommunities {
  //         id 
  //         title
  //         imageUrl
  //         creatorSlug
  //       }
  //     }`
  //   }).then((response) => response.json()) // Pega o retorno do response.json() e já retorna
  //     .then((respostaCompleta) => {
  //       const comunidadesVindasDoDato = respostaCompleta.data.allCommunities;
  //       console.log(comunidadesVindasDoDato)
  //       setComunidades(comunidadesVindasDoDato)
  //     })
  // }, []);


  return (
    <>
      <AlurakutMenu githubUser={githubUser} />
      <MainGrid>
        <div className="profileArea" style={{ gridArea: 'profileArea' }}>
          <ProfileSidebar githubUser={githubUser} />
        </div>

        <div className="welcomeArea" style={{ gridArea: 'welcomeArea' }}>
          <Box>
            <h1 className="title"> Bem vindo(a)</h1>
            <OrkutNostalgicIconSet confiavel={1} sexy={3} />
          </Box>
          <Box>
            <h2 className="subTitle">O que você deseja fazer?</h2>
            <form onSubmit={function handleCriarComunidade(e) {
              e.preventDefault();
              const dadosDoForm = new FormData(e.target)

              const comunidade = {
                id: new Date().toISOString(),
                title: dadosDoForm.get('title'),
                image: dadosDoForm.get('image')
              }

              const comunidadesAtualizadas = [...comunidades, comunidade]
              if (comunidadesAtualizadas.length < 7) setComunidades(comunidadesAtualizadas)
              else alert('Você só pode possuir 6 comunidades!')
            }}>
              <div>
                <input name="title" type="text" placeholder="Qual o nome da sua comunidade?" aria-label="Qual o nome da sua comunidade?" />
              </div>
              <div>
                <input name="image" placeholder="Entre com um numero qualquer que será a imagem da sua comunidade!" aria-label="Entre com um numero qualquer que será a imagem da sua comunidade!" />
              </div>
              <button>
                Criar comunidade
              </button>
            </form>
          </Box>
        </div>

        <div className="profileRelationsArea" style={{ gridArea: 'profileRelationsArea' }}>
          <ProfileRelationsBoxWrapper>
            <h2 className="smallTitle"> Conexões GitHub ({pessoasFavoritas.length}) </h2>
            <ul>
              {pessoasFavoritas.map((itemAtual) => {
                return (
                  <li key={itemAtual}>
                    <a href={`/users/${itemAtual}`} >
                      <img src={`https://github.com/${itemAtual}.png`} />
                      <span>{itemAtual}</span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </ProfileRelationsBoxWrapper>
          <ProfileRelationsBoxWrapper>
            <h2 className="smallTitle"> Minhas comunidades ({comunidades.length})</h2>
            <ul>
              {comunidades.map((itemAtual) => {
                return (
                  <li key={itemAtual.id}>
                    <a href={`/users/${itemAtual.title}`} >
                      <img src={`https://picsum.photos/200/300?${itemAtual.image}`} />
                      <span>{itemAtual.title}</span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </ProfileRelationsBoxWrapper>
        </div>
      </MainGrid>
    </>
  )
}

export async function getServerSideProps(context) {

  const cookies = nookies.get(context)
  const token = cookies.USER_TOKEN;

  const isAuthenticated = await fetch('https://alurakut.vercel.app/api/auth', {
    headers: {
      Authorization: token
    }
  })
    .then((resposta) => {
      return resposta.json()
    })

  if (!isAuthenticated) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      }
    }
  }

  const { githubUser } = jwt.decode(token);
  return {
    props: {
      githubUser
    }, // will be passed to the page component as props
  }

}
