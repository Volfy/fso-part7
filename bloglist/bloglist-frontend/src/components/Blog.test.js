import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Blog from "./Blog";

describe("<Blog />", () => {
  let container;
  const blog = {
    title: "Testing",
    author: "Jonathan",
    url: "website.com",
    likes: 2,
    user: {
      id: "10000",
      username: "user1",
      name: "Jill",
    },
  };
  const userDetails = {};
  const deleteBlog = () => {};
  const updateLikes = jest.fn();

  beforeEach(() => {
    container = render(
      <Blog
        blog={blog}
        user={userDetails}
        deleteBlog={deleteBlog}
        updateLikes={updateLikes}
      />
    ).container;
  });

  test("only renders title and author initially", () => {
    const element = screen.getByText("Testing by Jonathan");
    expect(element).toBeDefined();

    const missing = screen.queryByText("website.com");
    expect(missing).toBeNull();
  });

  test("shows url and likes when viewed", async () => {
    const user = userEvent.setup();
    const button = screen.getByText("View");
    await user.click(button);

    const element = container.querySelector(".blog");
    expect(element).toHaveTextContent("website.com");
    expect(element).toHaveTextContent("2 likes");
  });

  test("clicking like calls event handler", async () => {
    const user = userEvent.setup();
    const button = screen.getByText("View");
    await user.click(button);

    const likeButton = screen.getByText("Like");
    await user.click(likeButton);
    await user.click(likeButton);

    expect(updateLikes.mock.calls).toHaveLength(2);
  });
});
