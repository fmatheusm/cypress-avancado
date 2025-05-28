import stories from '../fixtures/stories.json';

describe('Hacker Stories', () => {
  const initialTerm = 'React';
  const newTerm = 'Cypress';

  context('Hitting on the real API', () => {
    beforeEach(() => {
      cy.intercept({
        method: 'GET',
        pathname: '**/search',
        query: {
          query: initialTerm,
        },
      }).as('getStoriesAPI');

      cy.visit('/');
      cy.wait('@getStoriesAPI');
    });

    it('shows 20 stories, then the next 20 after clicking "More"', () => {
      cy.get('.item').should('have.length', 20);

      cy.contains('More').should('be.visible').click();

      cy.wait('@getStoriesAPI');

      cy.get('.item').should('have.length', 40);
    });

    it('searches via the last searched term', () => {
      cy.intercept({
        method: 'GET',
        pathname: '**/search',
        query: {
          query: newTerm,
          page: '0',
        },
      }).as('getNewTermStories');

      cy.get('#search').should('be.visible').clear().type(`${newTerm}{enter}`);

      cy.wait('@getNewTermStories');

      cy.getLocalStorage('search').should('be.equal', newTerm);

      cy.get(`button:contains(${initialTerm})`).should('be.visible').click();

      cy.wait('@getStoriesAPI');

      cy.getLocalStorage('search').should('be.equal', initialTerm);

      cy.get('.item').should('have.length', 20);
      cy.get('.item').first().should('be.visible').and('contain', initialTerm);
      cy.get(`button:contains(${newTerm})`).should('be.visible');
    });
  });

  context('Mocking the api', () => {
    context('Footer and list of stories', () => {
      beforeEach(() => {
        cy.intercept('GET', `**/search?query=${initialTerm}&page=0`, {
          fixture: 'stories',
        }).as('getMockStories');

        cy.visit('/');
        cy.wait('@getMockStories');
      });

      it('shows the footer', () => {
        cy.get('footer')
          .should('be.visible')
          .and('contain', 'Icons made by Freepik from www.flaticon.com');
      });

      context('List of stories', () => {
        // Since the API is external,
        // I can't control what it will provide to the frontend,
        // and so, how can I assert on the data?
        // This is why this test is being skipped.
        // TODO: Find a way to test it out.
        it('shows the right data for all rendered stories', () => {
          cy.get('.item')
            .first()
            .should('be.visible')
            .and('contain', stories.hits[0].title)
            .and('contain', stories.hits[0].author)
            .and('contain', stories.hits[0].num_comments)
            .and('contain', stories.hits[0].points);

          cy.get(`.item a:contains(${stories.hits[0].title})`).should(
            'have.attr',
            'href',
            stories.hits[0].url
          );

          cy.get('.item')
            .last()
            .should('be.visible')
            .and('contain', stories.hits[1].title)
            .and('contain', stories.hits[1].author)
            .and('contain', stories.hits[1].num_comments)
            .and('contain', stories.hits[1].points);

          cy.get(`.item a:contains(${stories.hits[1].title})`).should(
            'have.attr',
            'href',
            stories.hits[1].url
          );
        });

        it('shows only less story after dimissing the first one', () => {
          cy.get('.button-small').first().should('be.visible').click();

          cy.get('.item').should('have.length', 1);
        });

        // Since the API is external,
        // I can't control what it will provide to the frontend,
        // and so, how can I test ordering?
        // This is why these tests are being skipped.
        // TODO: Find a way to test them out.
        context('Order by', () => {
          it('orders by title', () => {
            const title = '.list-header-button:contains(Title)';
            cy.get(title).should('be.visible').click();

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[0].title);

            cy.get(`.item a:contains(${stories.hits[0].title})`).should(
              'have.attr',
              'href',
              stories.hits[0].url
            );

            cy.get(title).click();

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[1].title);

            cy.get(`.item a:contains(${stories.hits[1].title})`).should(
              'have.attr',
              'href',
              stories.hits[1].url
            );
          });

          it('orders by author', () => {
            const author = '.list-header-button:contains(Author)';
            cy.get(author).should('be.visible').click();

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[0].title);

            cy.get(author).click();

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[1].title);
          });

          it('orders by comments', () => {
            const comments = '.list-header-button:contains(Comments)';
            cy.get(comments).should('be.visible').click();

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[1].num_comments);

            cy.get(comments).click();

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[0].num_comments);
          });

          it('orders by points', () => {
            const points = '.list-header-button:contains(Points)';
            cy.get(points).should('be.visible').click();

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[1].num_comments);

            cy.get(points).click();

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[0].num_comments);
          });
        });
      });
    });

    context('Search', () => {
      beforeEach(() => {
        cy.intercept(
          {
            method: 'GET',
            pathname: '**/search',
            query: {
              query: initialTerm,
            },
          },
          {
            fixture: 'empty',
          }
        ).as('getEmptyStories');

        cy.intercept(
          {
            method: 'GET',
            pathname: '**/search',
            query: {
              query: newTerm,
            },
          },
          {
            fixture: 'stories',
          }
        ).as('getSearchMockStories');

        cy.visit('/');
        cy.wait('@getEmptyStories');

        cy.get('#search').should('be.visible').clear();
      });

      it('shows no story when none is returned', () => {
        cy.get('.item').should('not.exist');
      });

      it('types and hits ENTER', () => {
        cy.get('#search').should('be.visible').type(`${newTerm}{enter}`);

        cy.wait('@getSearchMockStories');

        cy.getLocalStorage('search').should('be.equal', newTerm);

        cy.get('.item').should('have.length', 2);
        cy.get(`button:contains(${initialTerm})`).should('be.visible');
      });

      it('types and clicks the submit button', () => {
        cy.get('#search').should('be.visible').type(newTerm);
        cy.contains('Submit').should('be.visible').click();

        cy.wait('@getSearchMockStories');

        cy.getLocalStorage('search').should('be.equal', newTerm);

        cy.get('.item').should('have.length', 2);
        cy.get(`button:contains(${initialTerm})`).should('be.visible');
      });

      it('types and submits the from directly', () => {
        cy.get('#search').should('be.visible').type(newTerm);
        cy.get('form').submit();

        cy.wait('@getSearchMockStories');

        cy.getLocalStorage('search').should('be.equal', newTerm);

        cy.get('.item').should('have.length', 2);
      });

      context('Last searches', () => {
        it('shows a max of 5 buttons for the last searched terms', () => {
          const faker = require('faker');

          cy.intercept(
            {
              method: 'GET',
              path: '**/search**',
            },
            { fixture: 'empty' }
          ).as('getRandomStories');

          Cypress._.times(6, () => {
            const randomWord = faker.random.word();
            cy.get('#search').clear().type(`${randomWord}{enter}`);
            cy.wait('@getRandomStories');
            cy.getLocalStorage('search').should('be.equal', randomWord);
          });

          cy.get('.last-searches').within(() => {
            cy.get('button').should('have.length', 5);
          });
        });
      });
    });
  });
});

// Hrm, how would I simulate such errors?
// Since I still don't know, the tests are being skipped.
// TODO: Find a way to test them out.
context('Errors', () => {
  it('shows "Something went wrong ..." in case of a server error', () => {
    cy.intercept('GET', '**/search**', { statusCode: 500 }).as(
      'getServerFailure'
    );

    cy.visit('/');
    cy.wait('@getServerFailure');

    cy.get('p:contains(Something went wrong ...)').should('be.visible');
  });

  it('shows "Something went wrong ..." in case of a network error', () => {
    cy.intercept('GET', '**/search**', { forceNetworkError: true }).as(
      'getNetworkFailure'
    );

    cy.visit('/');
    cy.wait('@getNetworkFailure');

    cy.get('p:contains(Something went wrong ...)').should('be.visible');
  });
});

it('shows a "Loading..." state before showing the results', () => {
  cy.intercept('GET', '**/search**', {
    delay: 1000,
    fixture: 'stories',
  }).as('getDelayStories');

  cy.visit('/');
  cy.assertLoadingIsShownAndHidden();

  cy.wait('@getDelayStories');
  cy.get('.item').should('have.length', 2);
});
