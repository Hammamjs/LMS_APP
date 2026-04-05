import {
  ValidationOptions,
  registerDecorator,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'Match' })
export class MatchConstraint implements ValidatorConstraintInterface {
  validate(value: any, args?: ValidationArguments): Promise<boolean> | boolean {
    if (!args?.constraints || args.constraints.length === 0) return false;

    const relatedPropertyName = args.constraints[0] as string;
    const object = args.object as Record<string, any>;
    const relatedVlaue = object[relatedPropertyName] as string;

    return value === relatedVlaue;
  }

  defaultMessage(args?: ValidationArguments): string {
    if (!args?.constraints) return 'Matching failed';
    const relatedProperty = args.constraints?.[0] as string;
    return `${args.property} must match ${relatedProperty}`;
  }
}

export function Match(property: string, validationOption: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      propertyName,
      target: object.constructor,
      options: validationOption,
      constraints: [property],
      validator: MatchConstraint,
    });
  };
}
