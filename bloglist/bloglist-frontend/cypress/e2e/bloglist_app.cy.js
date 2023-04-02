const red = "rgb(169, 68, 66)";
const green = "rgb(60, 118, 61)";
const user1 = { username: "root", name: "Name", password: "toor" };
const user2 = { username: "diff", name: "Duff", password: "aaaa" };

describe("Blog app", function () {
  beforeEach(function () {
    cy.request("POST", "http://localhost:3003/api/testing/reset");
    cy.request("POST", "http://localhost:3000/api/users", user1);
    cy.request("POST", "http://localhost:3000/api/users", user2);
    cy.visit("http://localhost:3000");
  });

  it("Login form is shown", function () {
    cy.contains("Username");
    cy.contains("Password");
    cy.get("#login-button").should("contain", "Log In");
  });

  describe("Login", function () {
    it("succeeds with correct credentials", function () {
      cy.get("#username").type("root");
      cy.get("#password").type("toor");
      cy.get("#login-button").click();

      cy.contains("Name logged in");
    });

    it("fails with wrong credentials", function () {
      cy.get("#username").type("root");
      cy.get("#password").type("WRONG");
      cy.get("#login-button").click();

      cy.should("not.contain", "Name logged in");
      cy.get("#notif")
        .should("contain", "Wrong Credentials")
        .and("have.css", "color", red);
    });
  });

  describe("When logged in", function () {
    beforeEach(function () {
      cy.login(user1);
    });

    it("A blog can be created", function () {
      cy.get("#show-blog-form-btn").click();

      cy.get("#title").type("Title of Blog");
      cy.get("#author").type("Author Name");
      cy.get("#url").type("website.com");
      cy.get("#create-blog-btn").click();

      cy.get("#notif")
        .should("contain", "Title of Blog by Author Name added")
        .and("have.css", "color", green);

      cy.get(".bloglist").contains("Title of Blog");
      cy.get(".bloglist").contains("Author Name");
      cy.get(".bloglist").should("not.contain", "website.com");
    });

    it("a blog cannot be created with missing values", function () {
      cy.get("#show-blog-form-btn").click();

      cy.get("#title").type("Title of Blog");
      cy.get("#author").type("Author Name");
      cy.get("#create-blog-btn").click();

      cy.get("#notif")
        .should("contain", "Missing fields")
        .and("have.css", "color", red);

      cy.get(".bloglist").should("not.contain", "Title of Blog");
    });

    describe("when a blog already exists", function () {
      beforeEach(function () {
        const blog = {
          title: "Random Title",
          author: "Real Author",
          url: "website.com",
        };
        cy.createBlog(blog);
      });

      it("a blog can be liked", function () {
        cy.get(".blog > button").click();

        cy.get(".blog").contains("0 likes");
        cy.get(".blog").contains("Like").click();

        cy.get("#notif")
          .should("contain", "Liked Random Title by Real Author")
          .and("have.css", "color", green);
        cy.get(".blog").contains("1 likes");
      });

      it("a blog can be deleted", function () {
        cy.get(".blog > button").click();

        cy.get(".blog").contains("Remove").click();

        cy.get("#notif")
          .should("contain", "Deleted Random Title by Real Author")
          .and("have.css", "color", green);
        cy.get(".bloglist").should("not.contain", "Random Title");
      });

      it("a blog cannot be deleted by a different user", function () {
        cy.contains("Logout").click();
        cy.login(user2);

        cy.get(".bloglist").should("contain", "Random Title by Real Author");
        cy.get(".blog > button").click();

        cy.get(".blog").should("not.contain", "Remove");
      });
    });

    describe("when multiple blogs exist", function () {
      beforeEach(function () {
        cy.createBlog({
          title: "Title with second most likes",
          author: "James",
          url: "web2.com",
        });
        cy.createBlog({
          title: "Title with least likes",
          author: "James",
          url: "web.com",
        });
        cy.createBlog({
          title: "Title with most likes",
          author: "James",
          url: "web.com",
        });

        cy.contains("View").click();
        cy.contains("View").click();
        cy.contains("View").click();
      });

      it("blogs are ordered according to likes", function () {
        const blogs = [
          cy.get(".blog").contains("with most likes").parent(),
          cy.get(".blog").contains("with second most likes").parent(),
          cy.get(".blog").contains("with least likes").parent(),
        ];
        blogs[0].contains("Like").click();
        cy.wait(400);
        blogs[0].contains("Like").click();
        cy.wait(400);
        blogs[0].contains("Like").click();
        cy.wait(400);
        blogs[0].parent().contains("3 likes");

        blogs[1].contains("Like").click();
        cy.wait(400);
        blogs[1].contains("Like").click();
        cy.wait(400);
        blogs[1].parent().contains("2 likes");

        blogs[2].contains("Like").click();
        cy.wait(400);
        blogs[2].parent().contains("1 likes");

        cy.get(".blog").eq(0).contains("with most likes");
        cy.get(".blog").eq(1).contains("with second most likes");
        cy.get(".blog").eq(2).contains("with least likes");
      });
    });
  });
});
