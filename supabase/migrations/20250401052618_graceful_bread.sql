/*
  # Fix fromHeyAnon column casing

  1. Changes
    - Rename column from 'fromheyanon' to 'fromHeyAnon' to match camelCase convention

  2. Notes
    - This ensures consistency between database and React components
    - No data loss as we're just renaming the column
*/

-- Rename the column to match camelCase convention
ALTER TABLE prompts RENAME COLUMN fromheyanon TO "fromHeyAnon";