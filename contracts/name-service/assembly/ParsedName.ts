import { System } from "@koinos/sdk-as";

export class ParsedName {
  domain: string = '';
  name: string = '';

  constructor(name: string) {
    this.parseName(name);
  }

  /**
    * Validate a name or domain
    */
  private validateElement(element: string): void {
    System.require(element.length > 0, 'an element cannot be empty');
    System.require(!element.startsWith('-'), `element "${element}" cannot start with an hyphen (-)`);
    System.require(!element.endsWith('-'), `element "${element}" cannot end with an hyphen (-)`);
    System.require(!element.includes('--'), `element "${element}" cannot have consecutive hyphens (-)`);
  }

  /**
    * Parse a string name into a name_object
    * e.g.: "name.domain" => obj.name = "name" and obj.domain = "domain"
    * e.g.: "name.subdomain.domain" => obj.name = "name" and obj.domain = "subdomain.domain"
   */
  private parseName(name: string): void {
    const splittedNameArr = name.toLowerCase().split('.');

    // validate first element only 
    // everything after the first "." would have been previously validated
    this.validateElement(splittedNameArr[0]);

    // the first element of splittedNameArr is either a name or a TLA
    this.name = splittedNameArr.shift();

    // if splittedNameArr has 2 or more elements, that means a domain was provided 
    // otherwise it's a TLA, so keep the domain empty
    if (splittedNameArr.length >= 1) {
      // group the domain elements back with a '.'
      this.domain = splittedNameArr.join('.');
    }
  }

  /**
    * Return name formatted as "name.domain" (or "name" if not domain exists)
   */
  key(): string {
    if (this.domain.length == 0) {
      return this.name;
    }

    return `${this.name}.${this.domain}`;
  }
}