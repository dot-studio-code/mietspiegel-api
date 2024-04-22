# Rent Index API Server

This is an Express-based API server for querying residential status based on rent index data. The server interfaces with an SQLite database and provides an endpoint to retrieve the residential status for specific streets, years, and house numbers.

## Setup

First, clone the repository and navigate into the project directory:

```bash
git clone https://github.com/dot-studio-code/mietspiegel-api
cd mietspiegel-api
```

Then, install the required dependencies:

```bash
yarn install
```

## Configuration

Create a .env file in the root directory of your project and specify your custom settings. For example:

```env
PORT=3000
```

## Running the Server

To start the server, run:

```bash
yarn start
```

This will launch the server on the port specified in your .env file or 3000 if none is specified.
API Usage

The server offers the following endpoint:
`GET /:rentIndexYear/residentialStatus`

Parameters:

- `rentIndexYear` (path parameter): The year for the rent index data (e.g., 2017, 2019, 2023).
- `street`, `houseNumber`, `houseNumberSupplement` (optional), `zipCode` (query parameters): Details of the address to query.

Sample request:
`http://localhost:3000/2023/residentialStatus?zipCode=14197&houseNumber=57&street=Mecklenburgische Straße`

Responses:

- `200 OK`: Returns the residential status data if the address is found.
- `400 Bad Request`: If there are validation errors in the request parameters.
- `404 Not Found`: If no residential data is found for the provided address.
- `500 Internal Server Error`: If there is an error processing the request.

Response structure:

A valid response returns the "Wohnlage" (residential status) for the requested address in Berlin according to the respective street index for the Berlin Mietspiegel.

Sample response:
```json
{
    "status": "success",
    "request": {
        "houseNumber": 57,
        "street": "Mecklenburgische Straße",
        "zipCode": "14197",
        "rentIndexYear": "2023"
    },
    "data": {
        "matchedStreet": "Mecklenburgische Straße",
        "district": "ChWi",
        "eastWest": "west",
        "objectStatus": 2,
        "noiseLevel": false,
        "residentialSituation": "D",
        "houseNumberRange": {
            "block": "F",
            "start": {
                "houseNumber": 57
            },
            "end": {
                "houseNumber": 57
            }
        }
    }
}
```

In `data` object you'll find all information according to the matched line in the street index:
- `matchedStreet`: street matched from query param using fuzzy search on all streets in the respective street index,
- `district`: Abbreviation for the district in which the address is located:
    - `ChWi`: Charlottenburg-Wilmersdorf
    - `FrKr`: Friedrichshain-Kreuzberg
    - `Lich`: Lichtenberg
    - `MaHe`: Marzahn-Hellersdorf
    - `Mitt`: Mitte
    - `Neuk`: Neukölln
    - `Pank`: Pankow
    - `Rein`: Reineckendorf
    - `Span`: Spandau
    - `StZe`: Steglitz-Zehlendorf
    - `TrKö`: Treptow-Köpenick
    - `TSch`: Tempelhof-Schöneberg
- `eastWest`: Whether the address used to belong to East or West Germany
- `objectStatus`: The actual Wohnlage `0` corresponds to "einfach", `1` to "mittel" and  `2` to "gut"
- `noiseLevel`: Whether the location is considered noisy
- `residentialSituation`: Whether the address is located in the city center. `Z` means "in city center", `D` means "not in city center".
- `houseNumberRange`: The range of house numbers in the street index.
    - `block`: to which house numbers the block applies, `K` stands for "entire street", `F` stands for "all numbers in the range", `G` for "only even numbers in the range", `U` for "only odd numbers in the range"
    - `start`: information on the start house number of the range
    - `end`: information on the end house number of the range