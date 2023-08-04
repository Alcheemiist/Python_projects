import pandas as pd

def json_to_csv(input_file_path, output_file_path):
    # Read the JSON file into a pandas DataFrame
    df = pd.read_json(input_file_path)

    # Export the DataFrame to a CSV file
    df.to_csv(output_file_path, index=False)

if __name__ == "__main__":
    # Replace 'input_file.json' with the path to your JSON file
    input_file_path = 'STVSBGI_.json'

    # Replace 'output_file.csv' with the desired path for your CSV output file
    output_file_path = 'STVSBGI_.csv'

    json_to_csv(input_file_path, output_file_path)
