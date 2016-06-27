import React from 'react'
import { IndexLink, Link } from 'react-router'
import classes from './Header.scss'

export const Header = () => (
  <div>
    <IndexLink to='/' activeClassName={classes.activeRoute}>
      Home
    </IndexLink>
  </div>
)

export default Header
