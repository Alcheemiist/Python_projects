import pandas as pd
import os

def read_and_extract_dataa(file_path, column_name, idud):
    df = pd.read_csv(file_path)
    index = 1
    for i in df:
        if (i.__contains__(column_name)):
            index = i
    filtered_data = df.loc[df[index] == int(idud)]
    return filtered_data

def main():
    # Set the directory where your files are located
    directory_path = './Multiple/'
    idud = "51015"
    output_file_path = './record_2_['+ idud+ '].xlsx'
    file_list = os.listdir(directory_path)
    writer = pd.ExcelWriter(output_file_path, engine='openpyxl')

    for file_name in file_list:
        file_path = os.path.join(directory_path, file_name)
        column_name = '_PIDM'
        data = read_and_extract_dataa(file_path, column_name, idud)
        data.to_excel(writer, sheet_name=f"Sheet_{file_name}", index=False)
    writer._save()

if __name__ == "__main__":
    main()