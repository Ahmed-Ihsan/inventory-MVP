import React from 'react';
import { Card as UiCard, CardHeader, CardContent, CardFooter, CardTitle } from '../ui/card';
import { cn } from '../../lib/utils';

const Card = ({
  children,
  className = '',
  style = {},
  header = null,
  footer = null,
  hoverable = false,
}) => {
  return (
    <UiCard
      className={cn(hoverable && 'hover:shadow-md', className)}
      style={style}
    >
      {header && (
        <CardHeader className="pb-3">
          {typeof header === 'string' ? <CardTitle>{header}</CardTitle> : header}
        </CardHeader>
      )}
      <CardContent className={cn(!header && 'pt-6')}>{children}</CardContent>
      {footer && <CardFooter className="pt-0">{footer}</CardFooter>}
    </UiCard>
  );
};

export default Card;
