import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BlogForm from "./BlogForm";

test("BlogForm calls handler function with appropriate blog", async () => {
  const addBlog = jest.fn();
  const messager = () => {};
  const user = userEvent.setup();

  const { container } = render(
    <BlogForm addNewBlog={addBlog} messager={messager} />
  );

  const titleInput = container.querySelector("#title");
  const authorInput = container.querySelector("#author");
  const urlInput = container.querySelector("#url");
  const submit = screen.getByText("Create");

  await user.type(titleInput, "Gnitset");
  await user.type(authorInput, "Sally");
  await user.type(urlInput, "jjj.xyz");
  await user.click(submit);

  expect(addBlog.mock.calls).toHaveLength(1);
  expect(addBlog.mock.calls[0][0]).toEqual({
    title: "Gnitset",
    author: "Sally",
    url: "jjj.xyz",
  });
});
