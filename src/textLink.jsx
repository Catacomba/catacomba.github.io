import React from "react";

const TextLink = ({ text, link }) => {
    return (
        <a href={link} class="text-blue-600 dark:text-blue-500 hover:underline">
            {text}
        </a>
    );
}

export default TextLink