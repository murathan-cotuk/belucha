"use client";

import React from "react";
import styled from "styled-components";
import { tokens } from "@/design-system/tokens";

const StyledButton = styled.button`
  font-family: ${tokens.fontFamily.sans};
  font-weight: 600;
  font-size: ${tokens.fontSize.body};
  line-height: ${tokens.lineHeight.normal};
  border-radius: ${tokens.radius.button};
  padding: ${tokens.spacing.sm} ${tokens.spacing.lg};
  cursor: pointer;
  transition: background-color ${tokens.transition.base}, border-color ${tokens.transition.base}, color ${tokens.transition.base};

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Primary = styled(StyledButton)`
  background: ${tokens.primary.DEFAULT};
  color: white;
  border: none;

  &:hover:not(:disabled) {
    background: ${tokens.primary.hover};
  }
  &:active:not(:disabled) {
    background: ${tokens.primary.active};
  }
`;

const Secondary = styled(StyledButton)`
  background: ${tokens.background.main};
  color: ${tokens.dark[800]};
  border: 1px solid ${tokens.border.light};

  &:hover:not(:disabled) {
    background: ${tokens.background.soft};
    border-color: ${tokens.dark[500]};
  }
`;

const Ghost = styled(StyledButton)`
  background: transparent;
  color: ${tokens.dark[800]};
  border: none;

  &:hover:not(:disabled) {
    background: ${tokens.background.soft};
  }
`;

const Danger = styled(StyledButton)`
  background: ${tokens.state.error};
  color: white;
  border: none;

  &:hover:not(:disabled) {
    filter: brightness(0.95);
  }
`;

const variants = {
  primary: Primary,
  secondary: Secondary,
  ghost: Ghost,
  danger: Danger,
};

export function Button({ variant = "primary", type = "button", children, className, disabled, ...props }) {
  const Component = variants[variant] || Primary;
  return (
    <Component type={type} className={className} disabled={disabled} {...props}>
      {children}
    </Component>
  );
}

export default Button;
