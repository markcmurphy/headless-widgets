import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/Home.module.css';

// npm install @apollo/client graphql
// then import
import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
  gql,
} from '@apollo/client';

import { setContext } from '@apollo/client/link/context';

// passing in the widgets prop that is returned from getStaticProps() at the bottom
export default function Home({ widgets }) {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.grid}>
          <div className={styles.grid}>
            {/* taking widgets prop passed in to Home() and using map to iterate over the array to display each widget: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map */}
            {widgets.map((widget) => {
              // dangerouslySetInnerHTML requires that html be passed in as an object value with a __html key
              function returnHTML(widget) {
                return { __html: widget.html };
              }

              // rendering the widget name as a header, rendering HTML using dangerouslySetInnerHTML, and displaying HTML in a paragraph
              return (
                <>
                  <h3>{widget.name}</h3>
                  {/* to pass in HTML, must use dangerouslySetInnerHTML: https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml */}
                  <div dangerouslySetInnerHTML={returnHTML(widget)}></div>
                  <p>{widget.html}</p>
                </>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

// getStaticProps() will pre-render this page at build time using the properties (props) returned by getStaticProps.
//nextjs.org/learn/basics/data-fetching

export async function getStaticProps() {
  const httpLink = createHttpLink({
    uri: 'https://store-29iql3rwa6.mybigcommerce.com/graphql',
  });

  const authLink = setContext((_, { headers }) => {
    // get the authentication token from local storage if it exists
    // return the headers to the context so httpLink can read them
    return {
      headers: {
        ...headers,
        authorization: `Bearer ${process.env.REACT_APP_BIGCOMMERCE_TOKEN}`,
      },
    };
  });

  const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
  });

  const { data } = await client.query({
    query: gql`
      query fetchWidgets {
        site {
          content {
            renderedRegionsByPageType(pageType: HOME) {
              regions {
                name
                html
              }
            }
          }
        }
      }
    `,
  });
  return {
    props: {
      widgets: data.site.content.renderedRegionsByPageType.regions,
    },
  };
}
